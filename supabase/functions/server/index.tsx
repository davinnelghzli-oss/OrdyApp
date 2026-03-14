import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ddaf841f/health", (c) => {
  return c.json({ status: "ok" });
});

// Save business information
app.post("/make-server-ddaf841f/business", async (c) => {
  try {
    const body = await c.req.json();
    const { businessId, name, description, logo } = body;

    if (!businessId || !name) {
      return c.json({ error: "businessId and name are required" }, 400);
    }

    await kv.set(`business:${businessId}`, {
      id: businessId,
      name,
      description,
      logo,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, businessId });
  } catch (error) {
    console.error("Error saving business:", error);
    return c.json({ error: `Failed to save business: ${error}` }, 500);
  }
});

// Get business information
app.get("/make-server-ddaf841f/business/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const business = await kv.get(`business:${businessId}`);

    if (!business) {
      return c.json({ error: "Business not found" }, 404);
    }

    return c.json(business);
  } catch (error) {
    console.error("Error getting business:", error);
    return c.json({ error: `Failed to get business: ${error}` }, 500);
  }
});

// Save menu items
app.post("/make-server-ddaf841f/menu/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const body = await c.req.json();
    const { menuItems } = body;

    await kv.set(`menu:${businessId}`, {
      businessId,
      items: menuItems,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving menu:", error);
    return c.json({ error: `Failed to save menu: ${error}` }, 500);
  }
});

// Get menu items
app.get("/make-server-ddaf841f/menu/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const menu = await kv.get(`menu:${businessId}`);

    if (!menu) {
      return c.json({ items: [] });
    }

    return c.json(menu);
  } catch (error) {
    console.error("Error getting menu:", error);
    return c.json({ error: `Failed to get menu: ${error}` }, 500);
  }
});

// Save payment methods
app.post("/make-server-ddaf841f/payment/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const body = await c.req.json();
    const { paymentMethods } = body;

    await kv.set(`payment:${businessId}`, {
      businessId,
      methods: paymentMethods,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving payment methods:", error);
    return c.json({ error: `Failed to save payment methods: ${error}` }, 500);
  }
});

// Get payment methods
app.get("/make-server-ddaf841f/payment/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const payment = await kv.get(`payment:${businessId}`);

    if (!payment) {
      return c.json({ methods: [] });
    }

    return c.json(payment);
  } catch (error) {
    console.error("Error getting payment methods:", error);
    return c.json({ error: `Failed to get payment methods: ${error}` }, 500);
  }
});

// Create order
app.post("/make-server-ddaf841f/orders/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const body = await c.req.json();
    const { orderId, items, total, paymentMethod, tableNumber, customerName, notes } = body;

    const order = {
      id: orderId,
      businessId,
      items,
      total,
      paymentMethod,
      tableNumber,
      customerName,
      notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${businessId}:${orderId}`, order);

    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ error: `Failed to create order: ${error}` }, 500);
  }
});

// Get all orders for a business
app.get("/make-server-ddaf841f/orders/:businessId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const orders = await kv.getByPrefix(`order:${businessId}:`);

    return c.json({ orders: orders || [] });
  } catch (error) {
    console.error("Error getting orders:", error);
    return c.json({ error: `Failed to get orders: ${error}` }, 500);
  }
});

// Update order status
app.put("/make-server-ddaf841f/orders/:businessId/:orderId", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { status } = body;

    const order = await kv.get(`order:${businessId}:${orderId}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${businessId}:${orderId}`, updatedOrder);

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ error: `Failed to update order: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);