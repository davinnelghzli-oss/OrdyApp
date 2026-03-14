import { createBrowserRouter } from "react-router";
import Root from "./Root";
import ManagementDashboard from "./pages/ManagementDashboard";
import MenuManagement from "./pages/MenuManagement";
import PaymentSetup from "./pages/PaymentSetup";
import ConsumerOrder from "./pages/ConsumerOrder";
import OrderManagement from "./pages/OrderManagement";
import Home from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "management", Component: ManagementDashboard },
      { path: "menu", Component: MenuManagement },
      { path: "payment", Component: PaymentSetup },
      { path: "order/:businessId", Component: ConsumerOrder },
      { path: "orders", Component: OrderManagement },
    ],
  },
]);
