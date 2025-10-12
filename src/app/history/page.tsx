"use client";

import Sidebar from "@/app/components/sidebar";
import { useState, useEffect } from "react";
import { getOrderHistory, OrderResponse } from "@/app/lib/api";
import { FaCheckCircle } from "react-icons/fa";

export default function OrderHistoryPage() {
  const [orderHistory, setOrderHistory] = useState<OrderResponse[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchOrderHistory = async () => {
    try {
      const orders = await getOrderHistory();
      setOrderHistory(orders);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-black">
        Loading...
      </div>
    );

  const displayedOrders = showAll ? orderHistory : orderHistory.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 space-y-6 mt-12 md:ml-64">
        <h1 className="text-2xl font-semibold text-black mb-4">Order History</h1>

        {orderHistory.length === 0 && (
          <p className="text-black">You have no order history.</p>
        )}

        <div className="grid gap-4">
          {displayedOrders.map(order => (
            <div
              key={order.orderId}
              className="bg-gray-50 p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => setActiveOrder(order)}
            >
              <div className="flex flex-col gap-1 text-black">
                <span><strong>ID:</strong> {order.orderId}</span>
                <span><strong>Type:</strong> {order.type}</span>
                <span>
                  <strong>Status:</strong>{" "}
                  {order.status === "PENDING" && <span className="text-yellow-500">{order.status}</span>}
                  {order.status === "ACCEPTED" && <span className="text-yellow-500">{order.status}</span>}
                  {order.status === "COMPLETED" && (
                    <span className="text-green-500 flex items-center gap-1">
                      <FaCheckCircle /> {order.status}
                    </span>
                  )}
                  {order.status === "CANCELLED" && <span className="text-red-500">{order.status}</span>}
                </span>
              </div>
              <div className="text-black font-medium">
                ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        {orderHistory.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 px-4 py-2 rounded bg-yellow-400 text-black hover:bg-yellow-500"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        )}

        {/* Active Order Modal */}
        {activeOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow w-11/12 max-w-md flex flex-col gap-4 text-black">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <p><strong>Order ID:</strong> {activeOrder.orderId}</p>
              <p><strong>Type:</strong> {activeOrder.type}</p>
              <p><strong>Description:</strong> {activeOrder.description}</p>
              <p><strong>Price:</strong> ${activeOrder.price}</p>
              <p><strong>Status:</strong> {activeOrder.status}</p>
              <p><strong>Buyer ID:</strong> {activeOrder.buyerId}</p>
              <p><strong>Seller ID:</strong> {activeOrder.sellerId}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded border text-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
