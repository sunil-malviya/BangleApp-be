import Prisma from "./../../../db/prisma.js";
import StockTransactionUtil from "../../utils/stockTransaction.js";

class CuttingJobService {
  static async arrangeData(data, org_id) {
    console.log('[BACKEND SERVICE] Arranging data for organization:', org_id);
    
    let obj = {
      organization: {
        connect: { id: org_id },
      },
      createdDate: data.createdDate,
      completionDate: data.completionDate,
      note: data.note || "",
    };
    obj.status = 1;

    data.isOnlineWorker
      ? (obj.workerOnlineId = data.karigarId)
      : (obj.workerOffline = { connect: { id: data.karigarId } });

    data.isOnlineWorker
      ? (obj.workerStatus = "Online")
      : (obj.workerStatus = "Offline");

    console.log('[BACKEND SERVICE] Worker type:', data.isOnlineWorker ? 'Online' : 'Offline');
    console.log('[BACKEND SERVICE] Worker ID:', data.karigarId);

    // Calculate totals
    obj.totalitem = data.cuttingItems.length;
    obj.totalPipeQty = data.cuttingItems.reduce((total, item) => total + item.pipeQty, 0);
    
    // Calculate totalAvgBangleQty using totalItemBangles if available
    obj.totalAvgBangleQty = data.cuttingItems.reduce((total, item) => {
      // Use totalItemBangles if available, otherwise calculate from AvgBangleQty * pipeQty
      const itemTotalBangles = item.totalItemBangles || (item.AvgBangleQty * item.pipeQty);
      return total + itemTotalBangles;
    }, 0);
    
    obj.totalPrice = data.cuttingItems.reduce((total, item) => total + (item.pipeQty * item.perPipeCuttingPrice), 0);

    console.log('[BACKEND SERVICE] Total items:', obj.totalitem);
    console.log('[BACKEND SERVICE] Total pipes:', obj.totalPipeQty);
    console.log('[BACKEND SERVICE] Total bangles:', obj.totalAvgBangleQty);
    console.log('[BACKEND SERVICE] Total price:', obj.totalPrice);

    return { obj, cuttingItems: data.cuttingItems };
  }

  static async createCuttingJob(data) {
    console.log('[BACKEND SERVICE] Creating cutting job in database...');
    
    return await Prisma.$transaction(async (tx) => {
      console.log('[BACKEND SERVICE] Starting database transaction');
      
      // Verify pipe stock availability for all items before proceeding
      console.log('[BACKEND SERVICE] Verifying stock availability for all items');
      const stockCheckPromises = data.cuttingItems.map(async (item, index) => {
        const pipeStock = await tx.pipeStock.findUnique({
          where: { id: item.pipeStockId },
          select: { id: true, stock: true, size: true, color: true, organizationId: true }
        });
        
        if (!pipeStock) {
          throw new Error(`Pipe stock with ID ${item.pipeStockId} not found for item ${index + 1}`);
        }
        
        if (pipeStock.stock < item.pipeQty) {
          throw new Error(`Insufficient stock for item ${index + 1}. Requested: ${item.pipeQty}, Available: ${pipeStock.stock} for ${pipeStock.size} (${pipeStock.color})`);
        }
        
        console.log(`[BACKEND SERVICE] Stock verified for item ${index + 1}: ${pipeStock.size} (${pipeStock.color}) - Requested: ${item.pipeQty}, Available: ${pipeStock.stock}`);
        return { pipeStock, requestedQty: item.pipeQty };
      });
      
      // Wait for all stock checks to complete
      const stockCheckResults = await Promise.all(stockCheckPromises);
      
      // Create the cutting job
      const result = await tx.cuttingKarigarJob.create({ data: data.obj });
      console.log('[BACKEND SERVICE] Created cutting job with ID:', result.id);

      // Create cutting items
      const job_number = await tx.cuttingKarigarJob.count();
      console.log('[BACKEND SERVICE] Organization job number count:', job_number);
      
      const cuttingItems = data.cuttingItems.map((item, index) => {
        const mappedItem = {
          ...item,
          jobId: result.id,
          receivedQty: 0,
          receivedDate: null,
          receivedLog: [],
          // Calculate totalItemBangles if not provided
          totalItemBangles: item.totalItemBangles || (item.AvgBangleQty * item.pipeQty)
        };
        
        console.log(`[BACKEND SERVICE] Mapped cutting item ${index + 1}:`, 
          `PipeStockId: ${mappedItem.pipeStockId}, `,
          `PipeQty: ${mappedItem.pipeQty}, `,
          `TotalItemBangles: ${mappedItem.totalItemBangles}`
        );
        
        return mappedItem;
      });

      console.log('[BACKEND SERVICE] Creating', cuttingItems.length, 'cutting items');
      await tx.cuttingItem.createMany({
        data: cuttingItems,
      });
      
      // Update pipe stock quantities using the StockTransactionUtil
      console.log('[BACKEND SERVICE] Updating pipe stock quantities');
      const stockUpdatePromises = stockCheckResults.map(async ({ pipeStock, requestedQty }) => {
        // Create stock transaction and update stock
        const transactionData = {
          stockId: pipeStock.id,
          stockType: 'PIPE',
          transactionType: 'OUTWARD',
          quantity: requestedQty,
          note: `Used in cutting job #${result.id}`,
          jobId: result.id,
          organizationId: pipeStock.organizationId
        };
        
        const updatedStockData = await StockTransactionUtil.updateStockWithTransaction(tx, transactionData);
        
        console.log(`[BACKEND SERVICE] Updated stock for pipe ${pipeStock.id}. Deducted: ${requestedQty}, Remaining: ${updatedStockData.stock.stock}`);
        return updatedStockData;
      });
      
      // Wait for all stock updates to complete
      await Promise.all(stockUpdatePromises);

      console.log('[BACKEND SERVICE] Transaction completed successfully');
      return result;
    });
  }

  static async getAllCuttingJobs(filters = {}, page = 1, pageSize = 5) {
    return await Prisma.cuttingKarigarJob.findMany({
      where: filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        organization: true,
        workerOffline: true,
        cuttingItems: {
          include: {
            pipeStock: true,
            nagina: true
          }
        }
      },
    });
  }

  static async getCuttingJobById(id) {
    console.log('[BACKEND SERVICE] Getting cutting job by ID:', id);
    
    const result = await Prisma.cuttingKarigarJob.findUnique({
      where: { id },
      include: {
        organization: true,
        workerOffline: true,
        cuttingItems: {
          include: {
            pipeStock: true,
            nagina: true
          }
        }
      },
    });
    
    if (!result) {
      console.error('[BACKEND SERVICE] Job not found with ID:', id);
      return null;
    }
    
    // Count jobs in this organization to get job number
    if (result.organization && result.organization.id) {
      try {
        // For safety, check if the job has a creation date
        if (!result.createdDate) {
          console.warn('[BACKEND SERVICE] Job does not have createdDate field:', id);
          result.jobNumber = 1; // Default to 1 if no creation date
        } else {
          const jobCount = await Prisma.cuttingKarigarJob.count({
            where: { 
              organizationId: result.organization.id,
              createdDate: { lt: result.createdDate } // Use createdDate instead of createdAt
            }
          });
          
          // Add job number to the result
          result.jobNumber = jobCount + 1;
          console.log('[BACKEND SERVICE] Calculated job number for job:', result.jobNumber);
        }
      } catch (error) {
        console.error('[BACKEND SERVICE] Error calculating job number:', error.message);
        // Provide a fallback job number
        result.jobNumber = 1;
      }
    } else {
      console.warn('[BACKEND SERVICE] Could not determine organization for job number calculation');
      result.jobNumber = 1; // Default to 1 if no organization
    }
    
    console.log('[BACKEND SERVICE] Found job with ID:', id);
    return result;
  }

  static async getCuttingJobByJobNumber(organizationId) {
    try {
      console.log('[BACKEND SERVICE] Getting job count for organization:', organizationId);
      if (!organizationId) {
        console.error('[BACKEND SERVICE] Missing organizationId for job number calculation');
        return 1; // Default to 1 if no organization ID
      }
      
      const count = await Prisma.cuttingKarigarJob.count({
        where: {
          organizationId,
          isdeleted: 0
        }
      });
      
      console.log('[BACKEND SERVICE] Got job count for organization:', count);
      return count || 1; // Return at least 1 if count is 0
    } catch (error) {
      console.error('[BACKEND SERVICE] Error getting job count:', error.message);
      return 1; // Default to 1 on error
    }
  }

  static async updateCuttingJob(id, data) {
    console.log('[BACKEND SERVICE] Updating cutting job in database...');
    
    return await Prisma.$transaction(async (tx) => {
      console.log('[BACKEND SERVICE] Starting database transaction for update');
      
      // Get existing job with all cutting items
      const existingJob = await tx.cuttingKarigarJob.findUnique({
        where: { id },
        include: {
          cuttingItems: {
            select: { id: true, pipeStockId: true, pipeQty: true }
          }
        }
      });
      
      if (!existingJob) {
        throw new Error(`Cutting job with ID ${id} not found`);
      }
      
      console.log('[BACKEND SERVICE] Found existing job with', existingJob.cuttingItems.length, 'items');
      
      // Return stocks from original job items back to inventory
      console.log('[BACKEND SERVICE] Returning stocks from original items to inventory');
      for (const item of existingJob.cuttingItems) {
        // Get the pipe stock record
        const pipeStock = await tx.pipeStock.findUnique({
          where: { id: item.pipeStockId },
          select: { id: true, stock: true, organizationId: true }
        });
        
        if (!pipeStock) {
          console.warn(`[BACKEND SERVICE] Pipe stock ${item.pipeStockId} not found, skipping stock return`);
          continue;
        }
        
        // Create an INWARD transaction to return stock
        const transactionData = {
          stockId: item.pipeStockId,
          stockType: 'PIPE',
          transactionType: 'INWARD',
          quantity: item.pipeQty,
          note: `Returned from updated cutting job #${id}`,
          jobId: id,
          organizationId: pipeStock.organizationId
        };
        
        const updatedStockData = await StockTransactionUtil.updateStockWithTransaction(tx, transactionData);
        
        console.log(`[BACKEND SERVICE] Returned stock for pipe ${item.pipeStockId}. Added back: ${item.pipeQty}, New stock: ${updatedStockData.stock.stock}`);
      }
      
      // Verify pipe stock availability for all new items
      console.log('[BACKEND SERVICE] Verifying stock availability for all new items');
      const stockCheckPromises = data.cuttingItems.map(async (item, index) => {
        const pipeStock = await tx.pipeStock.findUnique({
          where: { id: item.pipeStockId },
          select: { id: true, stock: true, size: true, color: true, organizationId: true }
        });
        
        if (!pipeStock) {
          throw new Error(`Pipe stock with ID ${item.pipeStockId} not found for item ${index + 1}`);
        }
        
        if (pipeStock.stock < item.pipeQty) {
          throw new Error(`Insufficient stock for item ${index + 1}. Requested: ${item.pipeQty}, Available: ${pipeStock.stock} for ${pipeStock.size} (${pipeStock.color})`);
        }
        
        return { pipeStock, requestedQty: item.pipeQty };
      });
      
      // Wait for all stock checks to complete
      const stockCheckResults = await Promise.all(stockCheckPromises);
      
      // Update the cutting job main record
      const result = await tx.cuttingKarigarJob.update({
        where: { id },
        data: data.obj,
      });
      
      console.log('[BACKEND SERVICE] Updated cutting job main record');

      // Delete existing cutting items
      await tx.cuttingItem.deleteMany({
        where: { jobId: id },
      });
      
      console.log('[BACKEND SERVICE] Deleted existing cutting items');

      // Create new cutting items
      const cuttingItems = data.cuttingItems.map(item => ({
        ...item,
        jobId: result.id,
        receivedQty: 0,
        receivedDate: null,
        receivedLog: [],
        // Calculate totalItemBangles if not provided
        totalItemBangles: item.totalItemBangles || (item.AvgBangleQty * item.pipeQty)
      }));

      await tx.cuttingItem.createMany({
        data: cuttingItems,
      });
      
      console.log('[BACKEND SERVICE] Created', cuttingItems.length, 'new cutting items');
      
      // Deduct pipe stock quantities for new items using StockTransactionUtil
      console.log('[BACKEND SERVICE] Deducting pipe stock quantities for new items');
      const stockUpdatePromises = stockCheckResults.map(async ({ pipeStock, requestedQty }) => {
        // Create stock transaction and update stock
        const transactionData = {
          stockId: pipeStock.id,
          stockType: 'PIPE',
          transactionType: 'OUTWARD',
          quantity: requestedQty,
          note: `Used in updated cutting job #${id}`,
          jobId: id,
          organizationId: pipeStock.organizationId
        };
        
        const updatedStockData = await StockTransactionUtil.updateStockWithTransaction(tx, transactionData);
        
        console.log(`[BACKEND SERVICE] Updated stock for pipe ${pipeStock.id}. Deducted: ${requestedQty}, Remaining: ${updatedStockData.stock.stock}`);
        return updatedStockData;
      });
      
      // Wait for all stock updates to complete
      await Promise.all(stockUpdatePromises);
      
      console.log('[BACKEND SERVICE] Update transaction completed successfully');
      return result;
    });
  }

  static async deleteCuttingJob(idOrIds) {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return await Prisma.cuttingKarigarJob.updateMany({
      where: {
        id: { in: ids },
      },
      data: { isdeleted: 1 },
    });
  }

  static async receiveCuttingItems(id, data) {
    try {
      return await Prisma.$transaction(async (tx) => {
        console.log('[BACKEND SERVICE] Receiving cutting items for ID:', id);
        console.log('[BACKEND SERVICE] Received quantity:', data.quantity);
        
        // Find the cutting item
        const cuttingItem = await tx.cuttingItem.findUnique({
          where: { id },
          include: {
            job: true,
            pipeStock: true,
            nagina: true
          },
        });

        if (!cuttingItem) {
          console.error('[BACKEND SERVICE] Cutting item not found:', id);
          return null;
        }
        
        // Validate that we have all required relationships
        if (!cuttingItem.job) {
          console.error('[BACKEND SERVICE] Job not found for cutting item:', id);
          throw new Error('Job not found for this cutting item');
        }
        
        if (!cuttingItem.pipeStock) {
          console.error('[BACKEND SERVICE] PipeStock not found for cutting item:', id);
          throw new Error('PipeStock not found for this cutting item');
        }
        
        console.log('[BACKEND SERVICE] Found cutting item:', cuttingItem.id);
        console.log('[BACKEND SERVICE] Current received qty:', cuttingItem.receivedQty);

        // Get all cutting items for the job to calculate total progress
        const allCuttingItems = await tx.cuttingItem.findMany({
          where: { jobId: cuttingItem.jobId },
          select: {
            receivedQty: true,
            AvgBangleQty: true,
            pipeQty: true,
            totalItemBangles: true
          },
        });

        const totalReceived = allCuttingItems.reduce((sum, item) => sum + item.receivedQty, 0) + data.quantity;
        
        // Calculate total expected bangles using totalItemBangles if available
        const totalExpected = allCuttingItems.reduce((sum, item) => {
          // Use totalItemBangles if available, otherwise calculate from AvgBangleQty * pipeQty
          return sum + (item.totalItemBangles || (item.AvgBangleQty * item.pipeQty));
        }, 0);
        
        console.log('[BACKEND SERVICE] Total received after update:', totalReceived);
        console.log('[BACKEND SERVICE] Total expected:', totalExpected);

        // Update received quantity and log
        const updatedData = {
          receivedQty: cuttingItem.receivedQty + data.quantity,
          receivedDate: new Date(),
          receivedLog: [
            ...(cuttingItem.receivedLog || []),
            {
              timestamp: new Date().toISOString(),
              receivedBy: data.receivedBy,
              receivedQuantity: data.quantity,
            },
          ],
        };

        // Update the cutting item
        const updatedCuttingItem = await tx.cuttingItem.update({
          where: { id },
          data: updatedData,
        });
        
        console.log('[BACKEND SERVICE] Updated cutting item received qty:', updatedCuttingItem.receivedQty);

        // Check if we need to update the job status
        if (totalReceived >= totalExpected) {
          console.log('[BACKEND SERVICE] All items received, marking job as completed');
          await tx.cuttingKarigarJob.update({
            where: { id: cuttingItem.jobId },
            data: { status: 2 },
          });
        }

        // Now handle the CuttingStock update or creation
        console.log('[BACKEND SERVICE] Managing cutting stock');
        
        try {
          // Check if CuttingStock model exists in the schema - if not, skip this part
          if (!tx.cuttingStock) {
            console.warn('[BACKEND SERVICE] CuttingStock model not found in schema. Skipping stock update.');
            return updatedCuttingItem;
          }
          
          // Make sure we have all required properties for CuttingStock
          const size = cuttingItem.pipeStock?.size;
          const color = cuttingItem.pipeStock?.color;
          const width = cuttingItem.bangleWidth;
          const naginaId = cuttingItem.naginaId;
          const organizationId = cuttingItem.job.organizationId;
          
          if (!size || !color || !width || !naginaId || !organizationId) {
            console.error('[BACKEND SERVICE] Missing required properties for CuttingStock:', {
              size,
              color,
              width,
              naginaId,
              organizationId
            });
            throw new Error('Missing required properties for CuttingStock');
          }
          
          // Look for an existing cutting stock with the same properties
          console.log('[BACKEND SERVICE] Finding existing cutting stock with params:', {
            organizationId,
            size,
            color,
            width,
            naginaId
          });
          
          const existingCuttingStock = await tx.cuttingStock.findFirst({
            where: {
              organizationId,
              size,
              color,
              width,
              naginaId,
              isdeleted: 0
            }
          });
          
          let cuttingStock;
          let transactionType = 'INWARD';
          
          if (existingCuttingStock) {
            // Update existing cutting stock
            console.log('[BACKEND SERVICE] Found existing cutting stock:', existingCuttingStock.id);
            console.log('[BACKEND SERVICE] Current quantity:', existingCuttingStock.quantity);
            
            cuttingStock = await tx.cuttingStock.update({
              where: { id: existingCuttingStock.id },
              data: {
                quantity: existingCuttingStock.quantity + data.quantity,
                updatedAt: new Date()
              }
            });
            
            console.log('[BACKEND SERVICE] Updated cutting stock quantity:', cuttingStock.quantity);
          } else {
            // Create new cutting stock
            console.log('[BACKEND SERVICE] Creating new cutting stock');
            
            // Generate batch number based on current date and job ID
            const batchNumber = `CUT-${new Date().toISOString().substring(0, 10)}-${cuttingItem.jobId.substring(0, 6)}`;
            
            cuttingStock = await tx.cuttingStock.create({
              data: {
                size,
                color,
                width,
                naginaId,
                quantity: data.quantity,
                batchNumber,
                jobId: cuttingItem.jobId,
                organizationId
              }
            });
            
            console.log('[BACKEND SERVICE] Created cutting stock:', cuttingStock.id);
          }
          
          // Create a stock transaction if StockTransaction table exists
          if (tx.stockTransaction) {
            const stockTransaction = await tx.stockTransaction.create({
              data: {
                stockId: cuttingStock.id,
                stockType: 'CUTTING',
                transactionType,
                quantity: data.quantity,
                remainingStock: cuttingStock.quantity,
                note: `Received from cutting job #${cuttingItem.jobId}`,
                jobId: cuttingItem.jobId,
                organizationId
              }
            });
            
            console.log('[BACKEND SERVICE] Created stock transaction:', stockTransaction.id);
          } else {
            console.warn('[BACKEND SERVICE] StockTransaction model not found in schema. Skipping transaction creation.');
          }
        } catch (stockError) {
          console.error('[BACKEND SERVICE] Error managing cutting stock:', stockError.message);
          console.error('[BACKEND SERVICE] Stack trace:', stockError.stack);
          // Log error but continue with the transaction
          console.error('[BACKEND SERVICE] Will continue without updating cutting stock');
        }

        return updatedCuttingItem;
      });
    } catch (error) {
      console.error('[BACKEND SERVICE] Transaction error:', error.message);
      console.error('[BACKEND SERVICE] Stack trace:', error.stack);
      throw error;
    }
  }

  static async getPipeStocks(organizationId, filters = {}) {
    console.log("Getting pipe stocks for organization:", organizationId);
    const stocks = await Prisma.pipeStock.findMany({
      where: {
        organizationId,
        isdeleted: 0,
        // Don't filter by stock quantity for now
        stock: { gt: 0 }, 
      },
      // Include organization info for debugging
      include: {
        organization: {
          select: {
            id: true,
            orgName: true
          }
        }
      }
    });
    
    console.log(`Found ${stocks.length} pipe stocks for organization ${organizationId}`);
    return stocks;
  }

  static async getNaginhas(organizationId) {
    console.log("Getting naginhas for organization:", organizationId);
    const naginhas = await Prisma.nagina.findMany({
      where: {
        organizationId,
        isdeleted: 0 
      }
    });
    
    console.log(`Found ${naginhas.length} naginhas for organization ${organizationId}`);
    return naginhas;
  }

  static async getStockTransactions(stockId, organizationId, page = 1, pageSize = 10) {
    console.log(`[BACKEND SERVICE] Getting stock transactions for stock ID ${stockId}`);
    
    const transactions = await Prisma.stockTransaction.findMany({
      where: {
        stockId,
        organizationId,
        stockType: 'PIPE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    console.log(`[BACKEND SERVICE] Found ${transactions.length} transactions for stock ID ${stockId}`);
    return transactions;
  }
}

export default CuttingJobService; 