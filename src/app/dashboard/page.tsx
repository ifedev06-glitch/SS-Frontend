"use client";

import Sidebar from "@/app/components/sidebar";
import { useState, useEffect } from "react";
import { FaWallet, FaPlus } from "react-icons/fa";
import { BsCircleFill } from "react-icons/bs";
import {
  getDashboard,
  depositFunds,
  createBuyOrder,
  createSellOrder,
  acceptOrder,
  getMyPendingOrders,
  sellerConfirm,
  buyerConfirm,
  getOrder,
  DashboardResponse,
  WalletResponseDTO,
  OrderRequest,
  OrderResponse,
} from "@/app/lib/api";

type Tab = "BUY" | "SELL" | "SEARCH";

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | "">("");

  const [activeTab, setActiveTab] = useState<Tab>("BUY");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<OrderResponse | null>(null);

  const [pendingOrders, setPendingOrders] = useState<OrderResponse[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);

  const fetchDashboard = async () => {
    try {
      const dash = await getDashboard();
      setUser(dash);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const orders = await getMyPendingOrders();
      setPendingOrders(orders);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to fetch pending orders");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchPendingOrders();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-black">
        Loading...
      </div>
    );

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount) return;
    try {
      const res: WalletResponseDTO = await depositFunds(depositAmount as number);
      setUser(prev => (prev ? { ...prev, balance: res.balance } : prev));
      setDepositAmount("");
      setIsDepositModalOpen(false);
      alert(res.message);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Deposit failed");
    }
  };

  const handleCreateOrder = async () => {
    if (!price || !description) return;
    try {
      const req: OrderRequest = { price: price as number, description };
      const res: OrderResponse =
        activeTab === "BUY" ? await createBuyOrder(req) : await createSellOrder(req);
      alert(`${activeTab} order created: ${res.orderId}`);
      setPrice("");
      setDescription("");
      setSearchOrderId("");
      setSearchedOrder(null);
      setIsOrderModalOpen(false);
      fetchDashboard();
      fetchPendingOrders();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Order creation failed");
    }
  };

  const handleConfirmOrder = async (order: OrderResponse) => {
    try {
      let updatedOrder: OrderResponse;
      if (user?.id === order.sellerId) {
        updatedOrder = await sellerConfirm(order.orderId);
      } else if (user?.id === order.buyerId) {
        updatedOrder = await buyerConfirm(order.orderId);
      } else {
        alert("You are not authorized to confirm this order");
        return;
      }
      alert(`Order ${updatedOrder.orderId} confirmed`);
      setActiveOrder(null);
      fetchDashboard();
      fetchPendingOrders();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to confirm order");
    }
  };

  const handleSearchOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchOrderId) return;
    try {
      const order = await getOrder(searchOrderId);
      setSearchedOrder(order);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Order not found");
    }
  };

  const handleAcceptSearchedOrder = async () => {
    if (!searchedOrder) return;
    try {
      const accepted = await acceptOrder(searchedOrder.orderId);
      alert(`Order ${accepted.orderId} accepted`);
      setSearchedOrder(null);
      setSearchOrderId("");
      fetchDashboard();
      fetchPendingOrders();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to accept order");
    }
  };

  const renderStatusIcon = (status: string) => {
    if (status === "PAID" || status === "COMPLETED") return <BsCircleFill className="text-green-500" />;
    return <BsCircleFill className="text-yellow-500" />;
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 space-y-6 mt-12 md:ml-64">
        {/* User info */}
        {user && (
          <div className="bg-gray-100 p-3 rounded-lg shadow flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-base font-semibold text-black">{user.name}</h1>
              <p className="text-sm text-black">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 text-black font-medium">
              <FaWallet />
              <span>${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

       {/* Action Buttons */}
<div className="mt-3 flex flex-col md:flex-row gap-2">
  <div className="flex gap-2 w-full">
    {/* Deposit */}
    <button
      onClick={() => setIsDepositModalOpen(true)}
      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
    >
      Deposit
    </button>

        {/* Withdraw - Mock button */}
        <button
          onClick={() => alert("Withdraw not implemented yet")}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Withdraw
        </button>
      </div>

      {/* Create / Search Order */}
      <button
        onClick={() => setIsOrderModalOpen(true)}
        className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded flex items-center justify-center gap-2"
      >
        <FaPlus /> Create / Search Order
      </button>
    </div>


        {/* Pending Orders Card */}
        {pendingOrders.length > 0 && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow space-y-3">
            <h2 className="text-black font-semibold mb-2">Pending Orders</h2>
            <div className="flex flex-col gap-2">
              {pendingOrders.slice(0, 4).map(order => (
                <div
                  key={order.orderId}
                  className="bg-gray-50 text-black p-3 rounded-lg shadow flex justify-between items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveOrder(order)}
                >
                  <div className="flex flex-col gap-1 text-black">
                    <span className="flex items-center gap-2">
                      {renderStatusIcon(order.status)} <strong>ID:</strong> {order.orderId}
                    </span>
                    <span><strong>Type:</strong> {order.type}</span>
                    <span><strong>Status:</strong> {order.status}</span>
                  </div>
                  <div className="text-black font-medium">
                    ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
              {pendingOrders.length > 4 && (
                <div className="text-blue-500 cursor-pointer mt-2" onClick={() => alert("Show all pending orders")}>
                  View All
                </div>
              )}
            </div>
          </div>
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
                <button onClick={() => setActiveOrder(null)} className="px-4 py-2 rounded border text-black">Close</button>
                {(user?.id === activeOrder.sellerId || user?.id === activeOrder.buyerId) && (
                  <button onClick={() => handleConfirmOrder(activeOrder)} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">Confirm</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {isDepositModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
            <form onSubmit={handleDeposit} className="bg-white p-6 rounded shadow w-11/12 max-w-sm flex flex-col gap-4 text-black">
              <h2 className="text-lg font-semibold">Deposit Funds</h2>
              <input
                type="number"
                placeholder="Amount"
                value={depositAmount}
                onChange={e => setDepositAmount(Number(e.target.value))}
                className="border p-2 rounded text-black"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsDepositModalOpen(false)} className="px-4 py-2 rounded border text-black">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-500 text-white">Deposit</button>
              </div>
            </form>
          </div>
        )}

        {/* Create / Search Order Modal */}
        {isOrderModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-40">
            <div className="bg-white p-6 rounded shadow w-11/12 max-w-sm flex flex-col gap-4 text-black">
              <h2 className="text-lg font-semibold">Create / Search Order</h2>

              {/* Tab Buttons */}
              <div className="flex gap-2">
                {(["BUY", "SELL", "SEARCH"] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded ${activeTab === tab ? "bg-yellow-500 text-white" : "bg-gray-200 text-black"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "BUY" || activeTab === "SELL" ? (
                <>
                  <input type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} className="border p-2 rounded text-black" />
                  <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded text-black" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 rounded border text-black">Cancel</button>
                    <button onClick={handleCreateOrder} className="px-4 py-2 rounded bg-yellow-400 text-black">Create</button>
                  </div>
                </>
              ) : (
                <div>
                  <form onSubmit={handleSearchOrder} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Join order by ID"
                      value={searchOrderId}
                      onChange={e => setSearchOrderId(e.target.value)}
                      className="flex-1 border p-2 rounded text-black"
                    />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                  </form>
                  {searchedOrder && (
                    <div className="border p-3 rounded bg-gray-50 text-black mt-2">
                      <p><strong>Order ID:</strong> {searchedOrder.orderId}</p>
                      <p><strong>Type:</strong> {searchedOrder.type}</p>
                      <p><strong>Description:</strong> {searchedOrder.description}</p>
                      <p><strong>Price:</strong> ${searchedOrder.price}</p>
                      <p><strong>Status:</strong> {searchedOrder.status}</p>
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => {setSearchedOrder(null); setSearchOrderId("");}} className="px-4 py-2 rounded border text-black">Close</button>
                        <button onClick={handleAcceptSearchedOrder} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">Accept</button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 rounded border text-black">Close</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
