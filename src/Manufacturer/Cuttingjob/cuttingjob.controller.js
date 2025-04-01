import CuttingJobService from "./cuttingjob.service.js";

class CuttingJobController {
  static async createCuttingJob(req, res) {
    try {
      console.log('[BACKEND CONTROLLER] Create Cutting Job - Request received');
      
      const organization_id = req.user.organization.id;
      console.log('[BACKEND CONTROLLER] Organization ID:', organization_id);
      
      const body = req.getBody([
        "karigarId",
        "createdDate",
        "completionDate",
        "cuttingItems",
        "note",
        "isOnlineWorker",
      ]);
      
      console.log('[BACKEND CONTROLLER] Request body (karigarId, date info):', {
        karigarId: body.karigarId,
        isOnlineWorker: body.isOnlineWorker,
        createdDate: body.createdDate,
        completionDate: body.completionDate,
        itemCount: body.cuttingItems?.length || 0
      });
      
      // Validate that cuttingItems exists and is an array
      if (!body.cuttingItems || !Array.isArray(body.cuttingItems) || body.cuttingItems.length === 0) {
        console.error('[BACKEND CONTROLLER] No cutting items provided or invalid format');
        return res.status(400).json({
          status: false,
          message: 'No cutting items provided or invalid format',
          data: []
        });
      }
      
      // Process and validate the cuttingItems 
      console.log('[BACKEND CONTROLLER] Validating cutting items...');
      try {
        body.cuttingItems = body.cuttingItems.map((item, index) => {
          // Validate required fields
          if (!item.pipeStockId) {
            throw new Error(`Item ${index + 1}: Pipe stock ID is required`);
          }
          
          if (!item.pipeQty || item.pipeQty <= 0) {
            throw new Error(`Item ${index + 1}: Pipe quantity must be greater than 0`);
          }
          
          if (!item.naginaId) {
            throw new Error(`Item ${index + 1}: Nagina ID is required`);
          }
          
          // Remove any jobNumber field if it exists to prevent Prisma errors
          const { jobNumber, ...cleanedItem } = item;
          
          // If totalItemBangles is not provided, calculate it
          if (!cleanedItem.totalItemBangles) {
            cleanedItem.totalItemBangles = (cleanedItem.AvgBangleQty || 0) * (cleanedItem.pipeQty || 0);
            console.log(`[BACKEND CONTROLLER] Calculated totalItemBangles for item ${index + 1}:`, cleanedItem.totalItemBangles);
          }
          return cleanedItem;
        });
      } catch (validationError) {
        console.error('[BACKEND CONTROLLER] Validation error:', validationError.message);
        return res.status(400).json({
          status: false,
          message: validationError.message,
          data: []
        });
      }

      console.log('[BACKEND CONTROLLER] Arranging data for service...');
      const data = await CuttingJobService.arrangeData(body, organization_id);
      
      console.log('[BACKEND CONTROLLER] Calling service to create cutting job...');
      const result = await CuttingJobService.createCuttingJob(data);
      
      console.log('[BACKEND CONTROLLER] Cutting job created successfully:', result.id);
      return res.status(201).json({
        status: true,
        message: 'Cutting job created successfully',
        data: result
      });
    } catch (error) {
      console.error('[BACKEND CONTROLLER] Error creating cutting job:', error.message);
      
      // Check for Prisma-specific errors
      if (error.name === 'PrismaClientKnownRequestError') {
        console.error('[BACKEND CONTROLLER] Prisma error code:', error.code);
        console.error('[BACKEND CONTROLLER] Prisma error meta:', error.meta);
        
        // Handle specific Prisma errors
        if (error.meta?.field_name) {
          return res.status(400).json({
            status: false,
            message: `Database error: Invalid field '${error.meta.field_name}'`,
            data: []
          });
        }
      }
      
      // Check for specific error messages that indicate validation failures
      if (error.message && (error.message.includes('Insufficient stock') || error.message.includes('not found'))) {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: []
        });
      }
      
      return res.status(403).json({
        status: false,
        message: error.message || 'An error occurred while creating cutting job',
        data: []
      });
    }
  }

  static async getCuttingJobs(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const page = req.query.pageNo ? parseInt(req.query.pageNo, 10) : 1;
      let filter = req.query.filter ? JSON.parse(req.query.filter) : {};

      let cond = {
        organizationId: organization_id,
        isdeleted: 0,
        status: filter.status,
      };

      if (filter.dateRange && filter.dateRange.from && filter.dateRange.to) {
        cond.createdDate = {
          gte: new Date(filter.dateRange.from),
          lte: new Date(filter.dateRange.to),
        };
      }

      if (filter.search && filter.search.trim() !== "") {
        cond.workerOffline = {
          fullName: {
            contains: filter.search,
            mode: "insensitive",
          },
        };
      }
      const jobNumber = await CuttingJobService.getCuttingJobByJobNumber(organization_id);
      const records = await CuttingJobService.getAllCuttingJobs(cond, page);
      records['jobNumber'] = jobNumber;
      
      return res.status(200).json({
        status: true,
        message: 'SUCCESS',
        data: records,
        page
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to retrieve cutting jobs',
        data: []
      });
    }
  }

  static async getCuttingJobById(req, res) {
    try {
      console.log('[BACKEND CONTROLLER] Get Cutting Job by ID - Request received');
      console.log('[BACKEND CONTROLLER] Job ID:', req.params.id);
      
      const id = req.params.id;
      const organization_id = req.user.organization.id;
      
      try {
        // Get job details
        const result = await CuttingJobService.getCuttingJobById(id);
        
        if (!result) {
          console.error('[BACKEND CONTROLLER] Job not found:', id);
          return res.status(404).json({
            status: false,
            message: 'Cutting job not found',
            data: []
          });
        }
        
        // Get the organization-wide job number count to include in the response
        let jobNumber = 1; // Default value
        try {
          jobNumber = await CuttingJobService.getCuttingJobByJobNumber(organization_id);
        } catch (jobNumberError) {
          console.error('[BACKEND CONTROLLER] Error getting job number:', jobNumberError.message);
          // We'll use the default value of 1 here
        }
        
        console.log('[BACKEND CONTROLLER] Found job with ID:', result.id);
        console.log('[BACKEND CONTROLLER] Organization job number:', jobNumber);
        
        // Add job number directly to the result object before sending response
        result.jobNumber = result.jobNumber || jobNumber;
        
        // Create a response using the project's standard format
        const response = {
          status: true,
          message: 'SUCCESS',
          data: result,
          jobNumber: jobNumber,
          organizationJobNumber: jobNumber
        };
        
        console.log('[BACKEND CONTROLLER] Sending job details with job number:', jobNumber);
        return res.status(200).json(response);
      } catch (serviceError) {
        console.error('[BACKEND CONTROLLER] Service error:', serviceError.message);
        
        if (serviceError.name === 'PrismaClientKnownRequestError') {
          // Handle Prisma specific errors more gracefully
          if (serviceError.message.includes('Unknown argument')) {
            console.error('[BACKEND CONTROLLER] Schema mismatch error:', serviceError.message);
            return res.status(400).json({
              status: false,
              message: 'Database schema error. Please contact support.',
              data: []
            });
          }
        }
        
        throw serviceError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('[BACKEND CONTROLLER] Error fetching job details:', error.message);
      return res.status(403).json({
        status: false,
        message: error.message || 'SOMETHING_WENT_WRONG',
        data: process.env.SHOW_ERROR ? error.stack?.split("\n")?.splice(0, 10) : []
      });
    }
  }

  static async updateCuttingJob(req, res) {
    try {
      console.log('[BACKEND CONTROLLER] Update Cutting Job - Request received');
      
      const organization_id = req.user.organization.id;
      const id = req.params.id;
      
      console.log('[BACKEND CONTROLLER] Organization ID:', organization_id);
      console.log('[BACKEND CONTROLLER] Job ID to update:', id);

      const body = req.getBody([
        "karigarId",
        "createdDate",
        "completionDate",
        "cuttingItems",
        "note",
        "isOnlineWorker",
      ]);

      console.log('[BACKEND CONTROLLER] Update request body (high level):', {
        karigarId: body.karigarId,
        itemCount: body.cuttingItems?.length || 0
      });

      // Validate and clean cutting items
      if (body.cuttingItems && Array.isArray(body.cuttingItems)) {
        body.cuttingItems = body.cuttingItems.map((item, index) => {
          // Remove jobNumber field if it exists
          const { jobNumber, ...cleanedItem } = item;
          
          // If totalItemBangles is not provided, calculate it
          if (!cleanedItem.totalItemBangles) {
            cleanedItem.totalItemBangles = (cleanedItem.AvgBangleQty || 0) * (cleanedItem.pipeQty || 0);
            console.log(`[BACKEND CONTROLLER] Calculated totalItemBangles for item ${index + 1}:`, cleanedItem.totalItemBangles);
          }
          return cleanedItem;
        });
      }

      console.log('[BACKEND CONTROLLER] Arranging data for service...');
      const data = await CuttingJobService.arrangeData(body, organization_id);
      
      console.log('[BACKEND CONTROLLER] Calling service to update cutting job...');
      const result = await CuttingJobService.updateCuttingJob(id, data);
      
      console.log('[BACKEND CONTROLLER] Cutting job updated successfully');
      return res.status(200).json({
        status: true,
        message: 'Cutting job updated successfully',
        data: result
      });
    } catch (error) {
      console.error('[BACKEND CONTROLLER] Error updating cutting job:', error.message);
      
      // Check for Prisma-specific errors
      if (error.name === 'PrismaClientKnownRequestError') {
        console.error('[BACKEND CONTROLLER] Prisma error code:', error.code);
        console.error('[BACKEND CONTROLLER] Prisma error meta:', error.meta);
        
        if (error.meta?.field_name) {
          return res.status(400).json({
            status: false,
            message: `Database error: Invalid field '${error.meta.field_name}'`,
            data: []
          });
        }
      }
      
      return res.status(403).json({
        status: false,
        message: error.message || 'An error occurred while updating cutting job',
        data: []
      });
    }
  }

  static async deleteCuttingJobs(req, res) {
    try {
      const ids = req.query?.ids;
      const idarry = JSON.parse(ids);
      const result = await CuttingJobService.deleteCuttingJob(idarry);
      
      return res.status(200).json({
        status: true,
        message: 'Cutting jobs deleted successfully',
        data: result
      });
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        status: false,
        message: error.message || 'An error occurred while deleting cutting jobs',
        data: []
      });
    }
  }

  static async receiveCuttingItems(req, res) {
    try {
      console.log('[BACKEND CONTROLLER] Receive cutting items - Request received');
      console.log('[BACKEND CONTROLLER] Request body:', req.body);
      console.log('[BACKEND CONTROLLER] Request headers:', JSON.stringify(req.headers));
      console.log('[BACKEND CONTROLLER] Request URL:', req.originalUrl);
      console.log('[BACKEND CONTROLLER] Request method:', req.method);
      
      const name = req.user.fullName;
      const organization_id = req.user.organization.id;
      const body = req.getBody(["id", "quantity"]);
      
      console.log('[BACKEND CONTROLLER] Extracted body:', body);
      console.log('[BACKEND CONTROLLER] User details:', {
        name,
        organization_id,
        userHasOrgInfo: !!req.user.organization
      });
      
      // Validate input parameters
      if (!body.id) {
        console.error('[BACKEND CONTROLLER] Missing item ID');
        return res.status(400).json({
          status: false,
          message: 'Item ID is required',
          data: []
        });
      }
      
      if (!body.quantity || isNaN(body.quantity) || body.quantity <= 0) {
        console.error('[BACKEND CONTROLLER] Invalid quantity:', body.quantity);
        return res.status(400).json({
          status: false,
          message: 'A valid positive quantity is required',
          data: []
        });
      }
      
      console.log('[BACKEND CONTROLLER] Processing receive request:', {
        id: body.id,
        quantity: body.quantity,
        receivedBy: name
      });
      
      try {
        // Call the service method
        const result = await CuttingJobService.receiveCuttingItems(body.id, {
          quantity: body.quantity,
          receivedBy: name,
        });
        
        // Check if the operation succeeded
        if (!result) {
          console.error('[BACKEND CONTROLLER] Failed to receive cutting item - Item not found');
          return res.status(404).json({
            status: false,
            message: 'Cutting item not found',
            data: []
          });
        }
        
        // Get the organization-wide job number count to include in the response
        let jobNumber = 1;
        try {
          jobNumber = await CuttingJobService.getCuttingJobByJobNumber(organization_id);
        } catch (error) {
          console.error('[BACKEND CONTROLLER] Error getting job number:', error.message);
        }
        
        // Include job number in the response
        const response = {
          status: true,
          message: 'Item received successfully',
          data: result,
          jobNumber: jobNumber,
          organizationJobNumber: jobNumber
        };
        
        console.log('[BACKEND CONTROLLER] Successfully received cutting item:', result.id);
        console.log('[BACKEND CONTROLLER] Including job number in response:', jobNumber);
        
        return res.status(200).json(response);
      } catch (serviceError) {
        console.error('[BACKEND CONTROLLER] Service error:', serviceError.message);
        console.error('[BACKEND CONTROLLER] Error details:', serviceError);
        
        // Check for specific error types and provide clearer messages
        if (serviceError.message && serviceError.message.includes('findFirst')) {
          console.error('[BACKEND CONTROLLER] Error related to database operation (findFirst)');
          return res.status(400).json({
            status: false,
            message: 'Error processing cutting item: Database operation failed',
            data: []
          });
        }
        
        if (serviceError.meta && serviceError.meta.cause) {
          console.error('[BACKEND CONTROLLER] Prisma error cause:', serviceError.meta.cause);
          return res.status(400).json({
            status: false,
            message: `Database error: ${serviceError.meta.cause}`,
            data: []
          });
        }
        
        throw serviceError;
      }
    } catch (error) {
      console.error('[BACKEND CONTROLLER] Error receiving cutting items:', error.message);
      console.error('[BACKEND CONTROLLER] Stack trace:', error.stack);
      return res.status(403).json({
        status: false,
        message: error.message || 'Error receiving cutting items',
        data: []
      });
    }
  }

  static async getPipeStocks(req, res) {
    try {
      console.log("[DEBUG] getPipeStocks controller method START");
      console.log("[DEBUG] Request query:", req.query);
      console.log("[DEBUG] Request user:", req.user?.organization?.id);
      
      const organization_id = req.user.organization.id;
      const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
      
      // Try to get data from the database
      let result = await CuttingJobService.getPipeStocks(organization_id, filters);
      
      // If no data from database, return test data
      if (!result || result.length === 0) {
        console.log("[DEBUG] No data from database, returning test data");
        result = [
          { 
            id: "test1", 
            size: "12mm",
            color: "Red",
            quantity: 10,
            organizationId: organization_id 
          },
          { 
            id: "test2", 
            size: "15mm",
            color: "Blue",
            quantity: 15,
            organizationId: organization_id 
          }
        ];
      }
      
      console.log("[DEBUG] Pipe stocks result:", result ? "Data found" : "No data");
      console.log("[DEBUG] Sending response with type:", typeof result, "and length:", Array.isArray(result) ? result.length : "N/A");
      
      return res.status(200).json({
        status: true,
        message: 'SUCCESS',
        data: result
      });
    } catch (error) {
      console.log("[ERROR] getPipeStocks error:", error);
      return res.status(403).json({
        status: false,
        message: error.message || 'Failed to retrieve pipe stocks',
        data: []
      });
    }
  }

  static async getNaginhas(req, res) {
    try {
      console.log("[DEBUG] getNaginhas controller method START");
      console.log("[DEBUG] Request user:", req.user?.organization?.id);
      
      const organization_id = req.user.organization.id;
      
      // Try to get data from the database
      let result = await CuttingJobService.getNaginhas(organization_id);
      
      // If no data from database, return test data
      if (!result || result.length === 0) {
        console.log("[DEBUG] No data from database, returning test data");
        result = [
          { 
            id: "test-nagina1", 
            naginaName: "Test Nagina 1",
            naginaSize: "Small",
            organizationId: organization_id 
          },
          { 
            id: "test-nagina2", 
            naginaName: "Test Nagina 2",
            naginaSize: "Medium",
            organizationId: organization_id 
          }
        ];
      }
      
      console.log("[DEBUG] Naginhas result:", result ? "Data found" : "No data");
      console.log("[DEBUG] Sending response with type:", typeof result, "and length:", Array.isArray(result) ? result.length : "N/A");
      
      return res.status(200).json({
        status: true,
        message: 'SUCCESS',
        data: result
      });
    } catch (error) {
      console.log("[ERROR] getNaginhas error:", error);
      return res.status(403).json({
        status: false,
        message: error.message || 'Failed to retrieve naginhas',
        data: []
      });
    }
  }

  static async getStockTransactions(req, res) {
    try {
      console.log('[BACKEND CONTROLLER] Get Stock Transactions - Request received');
      
      const organization_id = req.user.organization.id;
      console.log('[BACKEND CONTROLLER] Organization ID:', organization_id);
      
      const stockId = req.params.stockId;
      console.log('[BACKEND CONTROLLER] Stock ID:', stockId);
      
      const page = req.query.pageNo ? parseInt(req.query.pageNo, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 10;
      
      // Get transactions for the specified stock
      const transactions = await CuttingJobService.getStockTransactions(
        stockId, 
        organization_id,
        page,
        pageSize
      );
      
      console.log(`[BACKEND CONTROLLER] Found ${transactions.length} stock transactions`);
      
      return res.status(200).json({
        status: true,
        message: 'SUCCESS',
        data: transactions,
        page
      });
    } catch (error) {
      console.error('[BACKEND CONTROLLER] Error getting stock transactions:', error.message);
      return res.status(403).json({
        status: false,
        message: error.message || 'An error occurred while retrieving stock transactions',
        data: []
      });
    }
  }
}

export default CuttingJobController; 