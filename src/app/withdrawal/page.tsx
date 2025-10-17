"use client";

import Sidebar from "@/app/components/sidebar";
import { useState, useEffect } from "react";
import {
  getRecipient,
  withdrawFunds,
  getDashboard,
  PaystackRecipient,
  WithdrawalRequest,
  verifyTransfer,
} from "@/app/lib/api";
import Link from "next/link";

export default function WithdrawalPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [recipient, setRecipient] = useState<PaystackRecipient | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferRef, setTransferRef] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  // 🔹 Load user + recipient data
  useEffect(() => {
    async function loadUserData() {
      try {
        const dash = await getDashboard();
        const rec = await getRecipient();
        setBalance(dash.balance);
        setUserId(dash.id);
        setRecipient(rec);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    loadUserData();
  }, []);

  // 🔹 Handle withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient) {
      setWithdrawalError("Please link your bank account before withdrawing.");
      return;
    }
    if (!amount || amount <= 0) {
      setWithdrawalError("Enter a valid amount greater than zero.");
      return;
    }
    if (amount > balance) {
      setWithdrawalError("Insufficient balance.");
      return;
    }

    setWithdrawalError(null);
    setLoading(true);

    try {
      const req: WithdrawalRequest = { userId: userId!, amount: amount as number };
      const res = await withdrawFunds(req);

      setTransferRef(res.reference);
      setTransferStatus(res.status);
      setIsModalOpen(true);
      setAmount("");
    } catch (error: any) {
      console.error(error);
      setWithdrawalError(error.response?.data?.message || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify transfer status
  const handleVerifyTransfer = async () => {
    if (!transferRef) return;
    setVerifying(true);
    try {
      const res = await verifyTransfer(transferRef);
      setTransferStatus(res.status);
      alert(`Transfer status: ${res.status}`);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to verify transfer");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 space-y-6 mt-12 md:ml-64 text-black">
        {/* Header */}
        <div className="bg-gray-100 p-3 rounded-lg shadow flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-base font-semibold">Withdrawal</h1>
            <p className="text-sm text-gray-600">Manage your payouts securely</p>
          </div>
          <div className="flex items-center gap-2 text-black font-medium">
            <span>Balance:</span>
            <span className="text-yellow-600 font-semibold">
              ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">
            Withdraw to Your Bank
          </h2>

          {/* If user has not linked recipient */}
          {!recipient ? (
            <div className="text-gray-600 text-center space-y-3">
              <p>❌ You have not linked a bank account yet.</p>
              <Link
                href="/dashboard/recipient"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md transition"
              >
                Link Bank Account
              </Link>
            </div>
          ) : (
            <>
              {/* ✅ Recipient Card (Safe against undefined values) */}
              <div className="border border-gray-300 p-4 rounded-md mb-6">
                <p className="font-semibold mb-1 text-black">
                  {recipient.accountName || recipient.name || "Unknown Account"}
                </p>
                <p className="text-gray-600 text-sm">
                  {recipient.bankName || recipient.bankCode || "Unknown Bank"} • ****
                  {recipient.accountNumber
                    ? recipient.accountNumber.slice(-4)
                    : "----"}
                </p>
              </div>

              {/* Withdrawal form */}
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-black">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Enter withdrawal amount"
                    className="w-full p-3 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {withdrawalError && (
                  <p className="text-red-600 text-sm">{withdrawalError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-md font-semibold text-black transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500"
                  }`}
                >
                  {loading ? "Processing..." : "Withdraw"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ✅ Success Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-sm w-full text-center shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-yellow-500">
                Withdrawal Initiated!
              </h2>
              <p className="text-gray-700 mb-2">
                Your withdrawal has been queued successfully.
              </p>
              {transferRef && (
                <p className="text-sm text-gray-600 mb-4">
                  Reference: <span className="font-mono">{transferRef}</span>
                </p>
              )}
              <p className="text-gray-700 mb-4">
                Status:{" "}
                <span className="font-semibold text-black">
                  {transferStatus || "pending"}
                </span>
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleVerifyTransfer}
                  disabled={verifying}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-semibold transition disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Verify Transfer"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-md font-semibold transition"
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
