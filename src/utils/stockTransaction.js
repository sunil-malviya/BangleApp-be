import Prisma from "../../db/prisma.js";

/**
 * Utility class for handling stock transactions
 */
class StockTransactionUtil {
  /**
   * Create a stock transaction record
   * @param {Object} tx - Prisma transaction object
   * @param {Object} data - Transaction data
   * @param {string} data.stockId - ID of the stock item
   * @param {string} data.stockType - Type of stock (PIPE, NAGINA, etc.)
   * @param {string} data.transactionType - Type of transaction (INWARD, OUTWARD, etc.)
   * @param {number} data.quantity - Quantity of items in the transaction
   * @param {number} data.remainingStock - Remaining stock after transaction
   * @param {string} data.note - Optional note about the transaction
   * @param {string} data.jobId - Optional ID of related job
   * @param {string} data.organizationId - Organization ID
   * @returns {Promise<Object>} - Created transaction record
   */
  static async createTransaction(tx, data) {
    console.log('[STOCK TRANSACTION] Creating transaction record:', data);
    
    try {
      const transaction = await tx.stockTransaction.create({
        data: {
          stockId: data.stockId,
          stockType: data.stockType,
          transactionType: data.transactionType,
          quantity: data.quantity,
          remainingStock: data.remainingStock,
          note: data.note || null,
          jobId: data.jobId || null,
          organizationId: data.organizationId
        }
      });
      
      console.log('[STOCK TRANSACTION] Transaction created successfully:', transaction.id);
      return transaction;
    } catch (error) {
      console.error('[STOCK TRANSACTION] Error creating transaction:', error);
      throw error;
    }
  }
  
  /**
   * Update stock quantity and create transaction record
   * @param {Object} tx - Prisma transaction object
   * @param {Object} data - Stock update data
   * @param {string} data.stockId - ID of the stock item
   * @param {string} data.stockType - Type of stock (PIPE, NAGINA, etc.)
   * @param {string} data.transactionType - Type of transaction (INWARD, OUTWARD, etc.)
   * @param {number} data.quantity - Quantity of items in the transaction
   * @param {string} data.note - Optional note about the transaction
   * @param {string} data.jobId - Optional ID of related job
   * @param {string} data.organizationId - Organization ID
   * @returns {Promise<Object>} - Updated stock and transaction record
   */
  static async updateStockWithTransaction(tx, data) {
    console.log('[STOCK TRANSACTION] Updating stock with transaction:', data);
    
    try {
      let updatedStock;
      
      // Update stock based on stock type
      if (data.stockType === 'PIPE') {
        // For PIPE stock type
        if (data.transactionType === 'INWARD') {
          // Increment stock for INWARD transactions
          updatedStock = await tx.pipeStock.update({
            where: { id: data.stockId },
            data: { 
              stock: { increment: data.quantity }
            }
          });
        } else if (data.transactionType === 'OUTWARD') {
          // Get current stock before updating
          const currentStock = await tx.pipeStock.findUnique({
            where: { id: data.stockId },
            select: { stock: true }
          });
          
          // Check if there's enough stock for outward transaction
          if (currentStock.stock < data.quantity) {
            throw new Error(`Insufficient stock. Available: ${currentStock.stock}, Requested: ${data.quantity}`);
          }
          
          // Decrement stock for OUTWARD transactions
          updatedStock = await tx.pipeStock.update({
            where: { id: data.stockId },
            data: { 
              stock: { decrement: data.quantity }
            }
          });
        } else if (data.transactionType === 'ADJUSTMENT') {
          // Set stock directly for ADJUSTMENT transactions
          updatedStock = await tx.pipeStock.update({
            where: { id: data.stockId },
            data: { 
              stock: data.quantity
            }
          });
        }
      }
      
      // Create transaction record
      const transactionData = {
        ...data,
        remainingStock: updatedStock.stock
      };
      
      const transaction = await this.createTransaction(tx, transactionData);
      
      return {
        stock: updatedStock,
        transaction
      };
    } catch (error) {
      console.error('[STOCK TRANSACTION] Error updating stock with transaction:', error);
      throw error;
    }
  }
}

export default StockTransactionUtil; 