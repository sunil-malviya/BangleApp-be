"use strict";
import { PrismaClient, TransactionType } from "@prisma/client";
const Prisma = new PrismaClient();

// Constants
const IS_DELETED_FALSE = 0;
const DEFAULT_TRANSACTION_PAGE_SIZE = 10;
const DEFAULT_TRANSACTION_TAKE = 20;
const DEFAULT_LIST_TRANSACTION_TAKE = 5;

class CuttingStockService {
  /**
   * Get all cutting stocks with filtering options
   */
  static async getAllCuttingStocks(organizationId, filters = {}, page = 1, pageSize = 10) {
    try {
      const skip = (page - 1) * pageSize;
      
      // Build filter conditions
      const whereCondition = {
        organizationId,
        isdeleted: IS_DELETED_FALSE,
      };
      
      // Apply filters
      if (filters.size) whereCondition.size = filters.size;
      if (filters.color) whereCondition.color = filters.color;
      if (filters.width) whereCondition.width = parseFloat(filters.width);
      if (filters.naginaId) whereCondition.naginaId = filters.naginaId;
      if (filters.minQuantity) whereCondition.quantity = { gte: parseInt(filters.minQuantity) };
      // Add more filters as needed (e.g., batchNumber, jobId)
      if (filters.jobId) whereCondition.jobId = filters.jobId;
      if (filters.batchNumber) whereCondition.batchNumber = { contains: filters.batchNumber, mode: 'insensitive' }; // Example search filter
      
      // Count total records matching the filters
      const totalCount = await Prisma.cuttingStock.count({
        where: whereCondition,
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Fetch the cutting stocks with paginated results
      let cuttingStocks = await Prisma.cuttingStock.findMany({
        where: whereCondition,
        include: {
          nagina: {
            select: {
              id: true,
              naginaName: true,
              naginaSize: true
            }
          },
          transactions: { // Include recent transactions
            orderBy: { createdAt: 'desc' },
            take: DEFAULT_LIST_TRANSACTION_TAKE,
          },
          _count: { // Include total transaction count
            select: { transactions: true },
          },
          organization: true // Include organization details
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      });

      // Process the results to include formatted details
      cuttingStocks = cuttingStocks.map(stock => {
        return {
          ...stock,
          formattedDetails: {
            size: stock.size,
            color: stock.color,
            width: `${stock.width} cm`,
            weight: `${stock.weight} gm`,
            nagina: stock.nagina ? {
              name: stock.nagina.naginaName,
              size: stock.nagina.naginaSize
            } : null,
            quantity: stock.quantity,
            bangleType: stock.bangleType
          }
        };
      });

      // Fetch job details for stocks that have jobId
      const stocksWithJobIds = cuttingStocks.filter(stock => stock.jobId);
      if (stocksWithJobIds.length > 0) {
        const jobIds = stocksWithJobIds.map(stock => stock.jobId);
        const jobs = await Prisma.cuttingKarigarJob.findMany({
          where: {
            id: { in: jobIds }
          },
          include: {
            workerOnline: {
              select: {
                id: true,
                fullName: true,
                mobile: true,
                email: true
              }
            },
            workerOffline: {
              select: {
                id: true,
                fullName: true,
                mobile: true,
                address: true,
                shopName: true
              }
            }
          }
        });

        // Create a map of jobId to job details
        const jobMap = jobs.reduce((acc, job) => {
          acc[job.id] = job;
          return acc;
        }, {});

        // Process the results to include worker details based on workerStatus
        cuttingStocks = cuttingStocks.map(stock => {
          if (stock.jobId && jobMap[stock.jobId]) {
            const job = jobMap[stock.jobId];
            const workerDetails = job.workerStatus === 'Online' 
              ? job.workerOnline 
              : job.workerOffline;
            
            return {
              ...stock,
              workerDetails: workerDetails ? {
                id: workerDetails.id,
                name: workerDetails.fullName,
                mobile: workerDetails.mobile,
                type: job.workerStatus,
                ...(job.workerStatus === 'Offline' ? {
                  address: workerDetails.address,
                  shopName: workerDetails.shopName
                } : {
                  email: workerDetails.email
                })
              } : null
            };
          }
          return stock;
        });
      }
      
      // Return raw data - formatting should happen in controller or frontend
      return {
        data: cuttingStocks, // Return the raw stock data including related fields
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching cutting stocks:', error);
      // Consider more specific error handling/logging
      throw new Error("Failed to fetch cutting stocks."); // Throw a generic error
    }
  }

  /**
   * Get a single cutting stock by ID
   */
  static async getCuttingStockById(stockId, organizationId) {
    try {
      const stock = await Prisma.cuttingStock.findFirst({
        where: {
          id: stockId,
          organizationId,
          isdeleted: IS_DELETED_FALSE,
        },
        include: {
          nagina: {
            select: {
              id: true,
              naginaName: true,
              naginaSize: true
            }
          },
          transactions: { // Include more transactions for detail view
            orderBy: { createdAt: 'desc' },
            take: DEFAULT_TRANSACTION_TAKE,
          },
          _count: {
            select: { transactions: true },
          },
          organization: true // Include organization details
        },
      });

      if (!stock) {
        const error = new Error("Cutting stock not found.");
        error.statusCode = 404;
        throw error;
      }

      // Add formatted details
      const stockWithFormattedDetails = {
        ...stock,
        formattedDetails: {
          size: stock.size,
          color: stock.color,
          width: `${stock.width} cm`,
          weight: `${stock.weight} gm`,
          nagina: stock.nagina ? {
            name: stock.nagina.naginaName,
            size: stock.nagina.naginaSize
          } : null,
          quantity: stock.quantity,
          bangleType: stock.bangleType
        }
      };

      // If stock has a jobId, fetch the job details
      if (stock.jobId) {
        const job = await Prisma.cuttingKarigarJob.findUnique({
          where: { id: stock.jobId },
          include: {
            workerOnline: {
              select: {
                id: true,
                fullName: true,
                mobile: true,
                email: true
              }
            },
            workerOffline: {
              select: {
                id: true,
                fullName: true,
                mobile: true,
                address: true,
                shopName: true
              }
            }
          }
        });

        if (job) {
          const workerDetails = job.workerStatus === 'Online' 
            ? job.workerOnline 
            : job.workerOffline;
          
          return {
            ...stockWithFormattedDetails,
            workerDetails: workerDetails ? {
              id: workerDetails.id,
              name: workerDetails.fullName,
              mobile: workerDetails.mobile,
              type: job.workerStatus,
              ...(job.workerStatus === 'Offline' ? {
                address: workerDetails.address,
                shopName: workerDetails.shopName
              } : {
                email: workerDetails.email
              })
            } : null
          };
        }
      }

      return stockWithFormattedDetails;
    } catch (error) {
      console.error(`Error fetching cutting stock by ID ${stockId}:`, error);
      if (error.statusCode === 404) throw error; // Re-throw specific errors
      throw new Error("Failed to fetch cutting stock details.");
    }
  }

  /**
   * Get transactions for a specific cutting stock with pagination
   */
  static async getStockTransactions(stockId, organizationId, page = 1, pageSize = DEFAULT_TRANSACTION_PAGE_SIZE) {
    try {
      const skip = (page - 1) * pageSize;
      
      // First, verify the stock exists for the organization
      const stockExists = await Prisma.cuttingStock.count({
        where: { id: stockId, organizationId, isdeleted: IS_DELETED_FALSE }
      });

      if (stockExists === 0) {
        const error = new Error("Cutting stock not found.");
        error.statusCode = 404;
        throw error;
      }

      // Count total transactions for this stock item
      const totalCount = await Prisma.stockTransaction.count({
        where: { stockId, organizationId },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize);

      // Fetch transactions with pagination
      const transactions = await Prisma.stockTransaction.findMany({
        where: { stockId, organizationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      });

      return {
        data: transactions,
        totalCount,
        totalPages,
        currentPage: page,
      };

    } catch (error) {
       console.error(`Error fetching transactions for stock ID ${stockId}:`, error);
       if (error.statusCode === 404) throw error;
       throw new Error("Failed to fetch stock transactions.");
    }
  }

  /**
   * Add new cutting stock manually
   */
  static async addCuttingStock(stockData, organizationId, userId) {
    // Basic service-level validation
    if (!stockData.size || !stockData.color || !stockData.width || !stockData.naginaId || typeof stockData.quantity === 'undefined' || !stockData.weight) {
      throw new Error("Missing required fields for cutting stock.");
    }
    if (isNaN(parseFloat(stockData.width)) || parseFloat(stockData.width) <= 0) {
        throw new Error("Invalid width provided.");
    }
     if (isNaN(parseInt(stockData.quantity)) || parseInt(stockData.quantity) < 0) {
        throw new Error("Invalid quantity provided.");
    }

    const { size, color, width, naginaId, quantity, weight, batchNumber } = stockData;
    const parsedQuantity = parseInt(quantity);
    const parsedWidth = parseFloat(width);


    try {
      // Use transaction to ensure stock and initial transaction are created atomically
      const [newStock] = await Prisma.$transaction([
        Prisma.cuttingStock.create({
          data: {
            size,
            color,
            width: parsedWidth,
            naginaId,
            quantity: parsedQuantity,
            weight,
            batchNumber: batchNumber || null, // Use null if undefined/empty
            organizationId,
            // jobId: null, // Explicitly null unless linked to a job later
            isdeleted: IS_DELETED_FALSE,
          },
        }),
        // Create the initial INWARD transaction
        Prisma.stockTransaction.create({
          data: {
            stock: { // Connect to the stock being created (implicitly handled by transaction order/context)
                 connect: {
                    organizationId_size_color_width_naginaId: { organizationId, size, color, width: parsedWidth, naginaId}
                 }
            },
            stockType: StockType.CUTTING,
            transactionType: TransactionType.INWARD,
            quantity: parsedQuantity,
            remainingStock: parsedQuantity, // Initial quantity is the remaining stock
            note: "Manual stock addition",
            organizationId,
            userId, // Link transaction to the user who performed the action
          },
        }),
      ]);

      // Re-fetch the newly created stock with relations if needed, or just return the basic object
       return await this.getCuttingStockById(newStock.id, organizationId); // Fetch with relations

    } catch (error) {
        // Handle potential unique constraint violation
        if (error.code === 'P2002') { // Prisma unique constraint violation code
             throw new Error("Cutting stock with these specifications (size, color, width, nagina) already exists.");
        }
        console.error('Error adding cutting stock:', error);
        throw new Error("Failed to add cutting stock.");
    }
  }

  /**
   * Update non-quantity details of a cutting stock item.
   * For quantity changes, use addStockTransaction.
   */
  static async updateCuttingStock(stockId, organizationId, updateData, userId) {
     // Validate allowed fields to update (e.g., batchNumber)
     const allowedUpdates = ['batchNumber']; // Add other allowed fields if necessary
     const dataToUpdate = {};
     for (const key of allowedUpdates) {
         if (updateData.hasOwnProperty(key)) {
             dataToUpdate[key] = updateData[key];
         }
     }

     if (Object.keys(dataToUpdate).length === 0) {
         throw new Error("No valid fields provided for update.");
     }

    try {
       // Ensure stock exists before updating
       const existingStock = await Prisma.cuttingStock.findFirst({
            where: { id: stockId, organizationId, isdeleted: IS_DELETED_FALSE },
            select: { id: true } // Only need to select 'id' to check existence
       });

        if (!existingStock) {
            const error = new Error("Cutting stock not found.");
            error.statusCode = 404;
            throw error;
        }

      const updatedStock = await Prisma.cuttingStock.update({
        where: {
          id: stockId,
          // Adding organizationId here might seem redundant but reinforces security/scoping
          // However, Prisma handles this with the findFirst check above. Let's rely on ID.
          // If using RLS, this might be necessary depending on policy.
        },
        data: dataToUpdate,
      });

      // Optionally, log the update action as a specific transaction type if needed?
      // For now, we assume only non-critical fields are updated here.

      return updatedStock;

    } catch (error) {
      console.error(`Error updating cutting stock ${stockId}:`, error);
      if (error.statusCode === 404) throw error;
      throw new Error("Failed to update cutting stock.");
    }
  }

  /**
   * Add a stock transaction (INWARD, OUTWARD, ADJUSTMENT, RETURN) and update stock quantity
   */
  static async addStockTransaction(stockId, organizationId, transactionData, userId) {
    // Service-level validation
     if (!transactionData.transactionType || !transactionData.quantity) {
        throw new Error("Missing required transaction fields (type, quantity).");
     }
      const parsedQuantity = parseInt(transactionData.quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
         throw new Error("Invalid transaction quantity provided.");
      }
      const validTransactionTypes = Object.values(TransactionType);
      if (!validTransactionTypes.includes(transactionData.transactionType)) {
        throw new Error("Invalid transaction type provided.");
      }

      const { transactionType, note } = transactionData;


    try {
      // Use Prisma transaction to ensure atomicity
      const [, updatedStock] = await Prisma.$transaction(async (prisma) => {
        // 1. Lock the stock row (or rely on transaction isolation) - find unique stock item
         const stock = await prisma.cuttingStock.findUnique({
             where: {
                id: stockId,
                // We might need the @@unique constraint fields if ID is not globally unique
                // Let's assume ID is the primary way to fetch uniquely here.
                // Ensure organizationId check for security.
                 organizationId: organizationId,
                 isdeleted: IS_DELETED_FALSE,
             }
         });

        if (!stock) {
          throw new Error("Cutting stock not found."); // Will cause transaction rollback
        }

        // 2. Calculate new quantity based on transaction type
        let newQuantity = stock.quantity;
        if (transactionType === TransactionType.INWARD || transactionType === TransactionType.RETURN || transactionType === TransactionType.ADJUSTMENT) {
           // For ADJUSTMENT, the sign of quantity could determine direction, but let's assume positive means inward/increase for now.
           // If ADJUSTMENT can decrease, logic needs refinement.
           newQuantity += parsedQuantity;
        } else if (transactionType === TransactionType.OUTWARD) {
           if (stock.quantity < parsedQuantity) {
               throw new Error("Insufficient stock for OUTWARD transaction."); // Rollback
           }
           newQuantity -= parsedQuantity;
        } else {
            // Should not happen due to validation above, but good practice
             throw new Error("Unsupported transaction type for quantity calculation.");
        }


        // 3. Create the transaction record
        await prisma.stockTransaction.create({
          data: {
            stockId,
            stockType: StockType.CUTTING,
            transactionType,
            quantity: parsedQuantity, // Record the actual amount moved/adjusted
            remainingStock: newQuantity, // Store the stock level AFTER this transaction
            note: note || null,
            organizationId,
            userId, // Link transaction to user
            // jobId: transactionData.jobId || null, // Link transaction to a job if applicable
          },
        });

        // 4. Update the stock quantity
        const finalStock = await prisma.cuttingStock.update({
          where: { id: stockId },
          data: { quantity: newQuantity },
           include: { // Return the updated stock with relations needed by frontend
                nagina: true,
                _count: { select: { transactions: true } },
                CuttingKarigarJob: {
                    include: {
                        workerOffline: { select: { fullName: true, mobile: true } },
                        workerOnline: { select: { fullName: true, mobile: true } }
                    }
                }
           }
        });
         return finalStock; // Return the updated stock from the transaction block
      }); // End of Prisma transaction

      return updatedStock;

    } catch (error) {
      console.error(`Error adding transaction for stock ${stockId}:`, error);
       // Rethrow specific known errors (like insufficient stock)
      if (error.message.includes("Insufficient stock") || error.message.includes("Cutting stock not found")) {
          throw error;
      }
      throw new Error("Failed to add stock transaction.");
    }
  }
}

export default CuttingStockService; 