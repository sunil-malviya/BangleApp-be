// "use strict";
// import CuttingStockService from "./Cuttingstock.service.js";
// // Removed Prisma import as controller shouldn't directly access DB

// /**
//  * Helper function to format stock data for the API response.
//  * This keeps presentation logic out of the service.
//  */
// const formatStockForApiResponse = (stock) => {
//   if (!stock) return null;

//   let karigarInfo = { karigarId: null, karigarName: "N/A", karigarMobile: "N/A" };
//   if (stock.CuttingKarigarJob) {
//      const job = stock.CuttingKarigarJob;
//      const worker = job.workerOffline || job.workerOnline;
//      karigarInfo = {
//         karigarId: job.workerOfflineId || job.workerOnlineId,
//         karigarName: worker?.fullName || "N/A",
//         karigarMobile: worker?.mobile || "N/A"
//      };
//   }

//   return {
//     // Include all raw stock fields
//     ...stock,
//     // Add a nested formatted object if the frontend specifically needs it
//     // Alternatively, the frontend can derive these fields itself
//     formattedData: {
//       id: stock.id,
//       size: stock.size,
//       color: stock.color,
//       width: `${stock.width} mm`, // Example formatting
//       quantity: stock.quantity,
//       weight: stock.weight,
//       batchNumber: stock.batchNumber || "N/A",
//       naginaName: stock.nagina?.naginaName || "N/A",
//       naginaSize: stock.nagina?.naginaSize || "N/A",
//       stockType: "CUTTING",
//       lastUpdated: stock.updatedAt,
//       jobId: stock.jobId,
//       jobNumber: stock.CuttingKarigarJob?.jobNumber || "N/A",
//       karigarName: karigarInfo.karigarName,
//       karigarMobile: karigarInfo.karigarMobile,
//       transactionCount: stock._count?.transactions || 0,
//       // Add any other fields the frontend expects in formattedData
//     }
//   };
// };

// class CuttingStockController {
//   /**
//    * Get all cutting stocks with filtering options
//    */
//   static async getCuttingStocks(req, res) {
//     try {
//       const organization_id = req.user.organization.id;
//       const filters = req.query.filter ? JSON.parse(req.query.filter) : {};
//       const page = req.query.pageNo ? parseInt(req.query.pageNo) : 1;
//       const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

//       console.log(`Fetching cutting stocks for org: ${organization_id} with filters:`, filters);

//       const result = await CuttingStockService.getAllCuttingStocks(
//         organization_id,
//         filters,
//         page,
//         pageSize
//       );

//       // Format each stock item in the data array
//       const formattedData = result.data.map(formatStockForApiResponse);

//       return res.status(200).json({
//         status: true,
//         message: "SUCCESS",
//         // Return both raw data and formatted data, or just formatted if frontend only uses that
//         data: result.data, // Raw data from service
//         formattedRecords: formattedData, // Formatted data for frontend convenience
//         totalCount: result.totalCount,
//         totalPages: result.totalPages,
//         currentPage: result.currentPage,
//       });
//     } catch (error) {
//       console.error("Error fetching cutting stocks:", error);
//       // Use a more specific error status if available (e.g., from service)
//       const statusCode = error.statusCode || 500;
//       return res.status(statusCode).json({
//         status: false,
//         message: error.message || "Failed to fetch cutting stocks",
//         data: [],
//       });
//     }
//   }

//   /**
//    * Get a single cutting stock by ID
//    */
//   static async getCuttingStockById(req, res) {
//     try {
//       const organization_id = req.user.organization.id;
//       const stockId = req.params.id;

//       console.log(`Fetching cutting stock with ID: ${stockId} for org: ${organization_id}`);

//       const stock = await CuttingStockService.getCuttingStockById(stockId, organization_id);

//       // Format the single stock item
//       const formattedStock = formatStockForApiResponse(stock);

//       return res.status(200).json({
//         status: true,
//         message: "Cutting stock retrieved successfully",
//         data: stock, // Raw data
//         formattedData: formattedStock.formattedData // Formatted data
//       });
//     } catch (error) {
//       console.error(`Error fetching cutting stock ${req.params.id}:`, error);
//       const statusCode = error.statusCode || 500;
//       return res.status(statusCode).json({
//         status: false,
//         message: error.message || "Failed to fetch cutting stock",
//         data: null,
//       });
//     }
//   }

//   /**
//    * Get transactions for a specific cutting stock
//    */
//   static async getStockTransactions(req, res) {
//     try {
//       const organization_id = req.user.organization.id;
//       const stockId = req.params.id;
//       const page = req.query.page ? parseInt(req.query.page) : 1;
//       const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

//       console.log(`Fetching transactions for cutting stock ID: ${stockId}, page: ${page}`);

//       const result = await CuttingStockService.getStockTransactions(
//         stockId,
//         organization_id,
//         page,
//         pageSize
//       );

//       return res.status(200).json({
//         status: true,
//         message: "SUCCESS",
//         data: result.data,
//         totalCount: result.totalCount,
//         totalPages: result.totalPages,
//         currentPage: result.currentPage,
//       });
//     } catch (error) {
//       console.error(`Error fetching transactions for stock ${req.params.id}:`, error);
//       const statusCode = error.statusCode || 500;
//       return res.status(statusCode).json({
//         status: false,
//         message: error.message || "Failed to fetch stock transactions",
//         data: [],
//       });
//     }
//   }

//   /**
//    * Add new cutting stock manually
//    */
//   static async addCuttingStock(req, res) {
//     try {
//       const organization_id = req.user.organization.id;
//       const userId = req.user.id;

//       // Assuming validation middleware (checkInput) handles extraction and basic validation
//       const stockData = req.body; // Use validated body from middleware

//       console.log("Attempting to add new cutting stock:", stockData);

//       const newStock = await CuttingStockService.addCuttingStock(stockData, organization_id, userId);

//       // Format the response
//       const formattedStock = formatStockForApiResponse(newStock);

//       return res.status(201).json({
//         status: true,
//         message: "Cutting stock added successfully",
//         data: newStock, // Raw data
//         formattedData: formattedStock.formattedData // Formatted data
//       });
//     } catch (error) {
//       console.error("Error adding cutting stock:", error);
//       // Check for specific errors like unique constraint violation
//       const statusCode = error.message.includes("already exists") ? 409 : (error.statusCode || 400); // 409 Conflict or 400 Bad Request
//       return res.status(statusCode).json({
//         status: false,
//         message: error.message || "Failed to add cutting stock",
//         data: null,
//       });
//     }
//   }

//   /**
//    * Update cutting stock (non-quantity fields like batchNumber)
//    */
//   static async updateCuttingStock(req, res) {
//     try {
//       const organization_id = req.user.organization.id; // Ensure user belongs to org, although service handles main check
//       const stockId = req.params.id;
//       const userId = req.user.id;

//       // Assuming validation middleware handles input
//       const updateData = req.body;

//       console.log(`Attempting to update stock ${stockId} with data:`, updateData);

//       const updatedStock = await CuttingStockService.updateCuttingStock(stockId, organization_id, updateData, userId);

//       const formattedStock = formatStockForApiResponse(updatedStock);

//       return res.status(200).json({
//         status: true,
//         message: "Cutting stock updated successfully",
//         data: updatedStock,
//         formattedData: formattedStock.formattedData
//       });
//     } catch (error) {
//       console.error(`Error updating stock ${req.params.id}:`, error);
//       const statusCode = error.statusCode || 400;
//       return res.status(statusCode).json({
//         status: false,
//         message: error.message || "Failed to update cutting stock",
//         data: null,
//       });
//     }
//   }

//   /**
//    * Add a stock transaction (adjusting quantity)
//    */
//   static async addStockTransaction(req, res) {
//     try {
//       const organization_id = req.user.organization.id;
//       const stockId = req.params.id;
//       const userId = req.user.id;

//       // Assuming validation middleware handles input
//       const transactionData = req.body;

//       console.log(`Attempting to add transaction for stock ${stockId}:`, transactionData);

//       const updatedStock = await CuttingStockService.addStockTransaction(stockId, organization_id, transactionData, userId);

//        const formattedStock = formatStockForApiResponse(updatedStock);

//       // The service now returns the updated stock
//       return res.status(200).json({
//         status: true,
//         message: "Stock transaction added successfully",
//         data: updatedStock, // Return the updated stock data
//         formattedData: formattedStock.formattedData
//       });
//     } catch (error) {
//       console.error(`Error adding transaction for stock ${req.params.id}:`, error);
//       const statusCode = error.message.includes("Insufficient stock") || error.message.includes("not found") ? 404 : (error.statusCode || 400);
//       return res.status(statusCode).json({
//         status: false,
//         message: error.message || "Failed to add stock transaction",
//         data: null,
//       });
//     }
//   }
// }

// export default CuttingStockController; 