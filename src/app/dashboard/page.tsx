"use client";

import Sidebar from "@/app/components/sidebar";
import Link from "next/link"; // add this at the top with other imports
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
  OrderRequest,
  OrderResponse,
} from "@/app/lib/api";

type Tab = "BUY" | "SELL" | "SEARCH";

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);
  const [isRedirectingToPaystack, setIsRedirectingToPaystack] = useState(false);



  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | "">("");
  const [depositError, setDepositError] = useState<string | null>(null);
  const [loadingDeposit, setLoadingDeposit] = useState(false);

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

    if (!depositAmount || depositAmount <= 0) {
      setDepositError("Please enter an amount greater than zero.");
      return;
    }

    setDepositError(null);
    setLoadingDeposit(true);

    try {
      const res = await depositFunds(depositAmount as number);
      console.log("Deposit Response:", res);

      if (res?.status && res?.data?.authorization_url) {
  setIsDepositModalOpen(false);

  // Show redirecting screen
  setIsRedirectingToPaystack(true);

  // Wait briefly, then redirect
  setTimeout(() => {
    window.location.href = res.data.authorization_url;
  }, 1500);
} else {
  setDepositError(res?.message || "Failed to initiate deposit.");
}

    } catch (err: any) {
      console.error("Deposit Error:", err);
      setDepositError(err?.response?.data?.message || "Deposit failed. Please try again.");
    } finally {
      setLoadingDeposit(false);
    }
  };

 const handleCreateOrder = async () => {
  if (!price || !description) return;

  // 🆕 Added: indicate loading started
  setLoadingCreateOrder(true);

  try {
    const req: OrderRequest = { price: price as number, description };
    const res: OrderResponse =
      activeTab === "BUY"
        ? await createBuyOrder(req)
        : await createSellOrder(req);
    
    // Order created successfully
    setCreatedOrderId(res.orderId);

    // Reset form + refresh data
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
  } finally {
    // 🆕 Added: stop loading spinner
    setLoadingCreateOrder(false);
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
              <span>₦{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 flex flex-col md:flex-row gap-2 w-full">
          <div className="flex gap-2 w-full mb-2 md:mb-0 md:flex-1 md:flex-row">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-full text-sm md:text-base"
            >
              Deposit
            </button>

           <Link
              href="/withdrawal"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-full text-center text-sm md:text-base rounded-full flex items-center justify-center"
            >
              Withdraw
            </Link>

          </div>

          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="w-full md:flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-1.5 rounded-full flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <FaPlus /> Create / Search Order
          </button>
        </div>

        {/* Pending Orders */}
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
                    ₦{order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

{/* Active Order Modal */}
{activeOrder && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-4 pt-6 pb-6 rounded-lg shadow-lg w-11/12 max-w-md text-black relative max-h-[90dvh] overflow-y-auto flex flex-col items-center text-base">
      
      {/* Close Button - top right */}
      <button
        onClick={() => setActiveOrder(null)}
        className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
      >
        &times;
      </button>

      <h2 className="text-lg font-semibold mb-4">Order Details</h2>

      <div className="space-y-2 text-sm w-full px-4">
        <p><strong>Order ID:</strong> {activeOrder.orderId}</p>
        <p><strong>Type:</strong> {activeOrder.type}</p>
        <p><strong>Description:</strong> {activeOrder.description}</p>
        <p><strong>Price:</strong> ₦{activeOrder.price.toLocaleString()}</p>
        <p><strong>Status:</strong> {activeOrder.status}</p>
        <p><strong>Buyer ID:</strong> {activeOrder.buyerId}</p>
        <p><strong>Seller ID:</strong> {activeOrder.sellerId}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 w-full px-4 flex flex-col items-center">
        <div className="flex justify-between gap-2 w-full">
          {/* Cancel Order */}
          <button
            onClick={() => alert("Cancel Order feature coming soon!")}
            className="flex-1 px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition"
          >
            Cancel Order
          </button>

          {/* Report Order */}
          <button
            onClick={() => alert("Report Order feature coming soon!")}
            className="flex-1 px-4 py-2 rounded-full border border-yellow-400 text-yellow-600 hover:bg-yellow-50 transition"
          >
            Report Order
          </button>
        </div>

        {(user?.id === activeOrder.sellerId || user?.id === activeOrder.buyerId) && (
          <button
            onClick={() => handleConfirmOrder(activeOrder)}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            {user?.id === activeOrder.sellerId ? "Seller Completed" : "Buyer Completed"}
          </button>
        )}
      </div>
    </div>
  </div>
)}




        {/* Deposit Modal */}
        {isDepositModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex justify-center items-center">
            <form
              onSubmit={handleDeposit}
              className="bg-white p-6 rounded shadow w-11/12 max-w-sm flex flex-col gap-4 text-black"
            >
              <h2 className="text-lg font-semibold">Deposit Funds</h2>
              <input
                type="number"
                min={1}
                placeholder="Amount"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="border p-2 rounded text-black"
                disabled={loadingDeposit}
              />
              {depositError && <p className="text-red-600">{depositError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-3 py-1 md:px-4 md:py-2 rounded-md border text-black"
                  disabled={loadingDeposit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingDeposit}
                  className="px-3 py-1 md:px-4 md:py-2 rounded-md bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {loadingDeposit ? "Processing..." : "Deposit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Order Create/Search Modal */}
        {/* Order Create/Search Modal */}
{isOrderModalOpen && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Create or Search Order</h2>
        <button
          onClick={() => setIsOrderModalOpen(false)}
          className="text-black font-bold text-xl"
        >
          &times;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        {(["BUY", "SELL", "SEARCH"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPrice("");
              setDescription("");
              setSearchOrderId("");
              setSearchedOrder(null);
            }}
            className={`flex-1 py-2 rounded-md transition-colors ${
              activeTab === tab
                ? "bg-yellow-400 text-black shadow-md"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "SEARCH" && (
        <form onSubmit={handleSearchOrder} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={searchOrderId}
            onChange={e => setSearchOrderId(e.target.value)}
            className="flex-1 border p-2 rounded-md shadow-sm text-black focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 rounded-md shadow-sm hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </form>
      )}

      {(activeTab === "BUY" || activeTab === "SELL") && (
        <div className="space-y-3 mb-4">
          <input
            type="number"
            min={1}
            placeholder="Price"
            value={price}
            onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="border p-2 rounded-md w-full shadow-sm text-black focus:ring-2 focus:ring-yellow-400"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border p-2 rounded-md w-full shadow-sm text-black focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleCreateOrder}
            disabled={!price || !description || loadingCreateOrder}
            className="w-full bg-green-500 text-white py-2 rounded-md shadow-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loadingCreateOrder ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>Create {activeTab} Order</>
            )}
          </button>
        </div>
      )}

      {/* Search Order Result */}
      {searchedOrder && (
        <div className="border p-3 rounded-md bg-gray-50 text-black shadow-inner">
          <p><strong>Order ID:</strong> {searchedOrder.orderId}</p>
          <p><strong>Type:</strong> {searchedOrder.type}</p>
          <p><strong>Description:</strong> {searchedOrder.description}</p>
          <p><strong>Price:</strong> ₦{searchedOrder.price}</p>
          <p><strong>Status:</strong> {searchedOrder.status}</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setSearchedOrder(null)}
              className="px-3 py-1 rounded-md border text-black hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {searchedOrder.status === "PENDING" && (
              <button
                onClick={handleAcceptSearchedOrder}
                className="px-3 py-1 rounded-md bg-yellow-400 text-white hover:bg-yellow-600 transition-colors"
              >
                Accept Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)}


{/* Order Created Modal */}
{createdOrderId && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex justify-center items-center z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-md w-11/12 max-w-sm flex flex-col gap-4 text-black">
      
      {/* Close Button */}
      <button
        onClick={() => setCreatedOrderId(null)}
        className="absolute top-2 right-2 text-2xl text-red-600 hover:text-red-800 focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>

      <h2 className="text-lg font-semibold">Order Created</h2>
      <p>Your order has been created successfully. Please copy the Order ID and share it with the other party.</p>

      <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
        <span className="break-all">{createdOrderId}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(createdOrderId);
            setCopySuccess("Copied!");
            setTimeout(() => setCopySuccess(null), 2000);
          }}
          className="ml-2 px-3 py-1 text-sm text-black border border-black hover:border-blue-800 rounded transition-colors"
          aria-label="Copy Order ID"
        >
          {copySuccess || "Copy"}
        </button>
      </div>

      {copySuccess && <p className="text-green-600">{copySuccess}</p>}
    </div>
  </div>
)}

      </div>
      {/* Redirecting to Paystack Page */}
{isRedirectingToPaystack && (
  <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-[100] text-black">
    <div className="flex flex-col items-center space-y-4">
      <svg
        className="animate-spin h-10 w-10 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
        ></path>
      </svg>
      <p className="text-lg font-medium">Redirecting you to Paystack...</p>
      <p className="text-sm text-gray-600">Please wait, do not close this window.</p>
    </div>
  </div>
)}

    </div>
  );
}
