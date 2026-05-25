import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { items, customerDetails, paymentMethod, orderTotal } = body;
    
    if (!items || !items.length || !customerDetails || !orderTotal) {
      return NextResponse.json({ success: false, message: 'Missing order details' }, { status: 400 });
    }
    
    // Generate a unique order number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `AW-ORD-${randomSuffix}`;
    
    // Validate stock and decrement it
    for (const item of items) {
      const product = await Product.findOne({ itemId: item.productId });
      if (!product) {
        return NextResponse.json({ success: false, message: `Product ${item.name} not found` }, { status: 404 });
      }
      
      const sizeStock = product.sizeStock || {};
      const currentQty = sizeStock[item.size] || 0;
      
      if (currentQty < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Insufficient stock for ${item.name} (Size: ${item.size}). Only ${currentQty} left.` 
        }, { status: 400 });
      }
      
      // Decrement stock
      sizeStock[item.size] = currentQty - item.quantity;
      product.sizeStock = sizeStock;
      product.markModified('sizeStock');
      
      // Re-calculate total available stock
      const newTotalStock = Object.values(sizeStock).reduce((sum, qty) => sum + (qty || 0), 0);
      product.currentStock = newTotalStock;
      product.inStock = newTotalStock > 0;
      
      await product.save();
    }
    
    // Create order record
    const newOrder = await Order.create({
      orderNumber,
      items,
      customerDetails,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      orderStatus: 'pending',
      orderTotal,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order placed successfully!', 
      orderNumber,
      order: newOrder 
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
