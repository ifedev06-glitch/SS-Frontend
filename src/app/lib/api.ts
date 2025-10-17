// src/app/lib/api.ts
import axios from "axios";
import { BACKEND_BASE_URL, LOGIN_API, REGISTER_API } from "@/app/lib/constatnt";
import { getToken } from "./auth";

// ---------- Axios instance ----------
const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 5000,
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Auth Interfaces ----------
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { id: number; name: string; email: string; balance: number; token: string; }
export interface SignupRequest { name: string; email: string; password: string; }
export interface SignupResponse { id: number; name: string; email: string; balance: number; }
export interface UserInfo { id: number; name: string; email: string; balance: number; }

// ---------- Auth Functions ----------
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(LOGIN_API, credentials);
  return response.data;
}

export async function signupUser(credentials: SignupRequest): Promise<SignupResponse> {
  const response = await apiClient.post<SignupResponse>(REGISTER_API, credentials);
  return response.data;
}

// ---------- Dashboard / Orders Interfaces ----------
export interface Order {
  orderId: string;
  type: "BUY" | "SELL";
  price: number;
  description: string;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  sellerId: number | null;
  buyerId: number | null;
}

export interface DashboardResponse {
  id: number;
  name: string;
  email: string;
  balance: number;
  myPendingOrders: Order[];         // ✅ now only accepted pending orders
  availablePendingOrders: Order[];
  orderHistory: Order[];
}

// Fetch dashboard data
export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>("/user/dashboard");
  return response.data;
}

// ---------- Wallet / Deposit ----------
export interface DepositResponseDTO {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function depositFunds(amount: number): Promise<DepositResponseDTO> {
  const response = await apiClient.post<DepositResponseDTO>("/deposit", { amount });
  return response.data;
}

// ---------- Orders Endpoints ----------
export interface OrderRequest { price: number; description: string; }
export interface OrderResponse {
  orderId: string;
  type: "BUY" | "SELL";
  price: number;
  description: string;
  status: string;
  sellerId: number | null;
  buyerId: number | null;
}

// Create buy order
export async function createBuyOrder(req: OrderRequest): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>("/orders/buy", req);
  return response.data;
}

// Create sell order
export async function createSellOrder(req: OrderRequest): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>("/orders/sell", req);
  return response.data;
}

// Accept order
export async function acceptOrder(orderId: string): Promise<OrderResponse> {
  const response = await apiClient.patch<OrderResponse>(`/orders/${orderId}/accept`);
  return response.data;
}

// Seller confirms order
export async function sellerConfirm(orderId: string): Promise<OrderResponse> {
  const response = await apiClient.patch<OrderResponse>(`/orders/${orderId}/seller-confirm`);
  return response.data;
}

// Buyer confirms order
export async function buyerConfirm(orderId: string): Promise<OrderResponse> {
  const response = await apiClient.patch<OrderResponse>(`/orders/${orderId}/buyer-confirm`);
  return response.data;
}

// Fetch order by ID
export async function getOrder(orderId: string): Promise<OrderResponse> {
  const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
  return response.data;
}

// Alias
export const generateOrderById = getOrder;

// Fetch my pending orders (now only accepted pending orders)
export async function getMyPendingOrders(): Promise<OrderResponse[]> {
  const response = await apiClient.get<OrderResponse[]>(`/orders/pending`);
  return response.data;
}

// ---------- Order History ----------
export async function getOrderHistory(): Promise<OrderResponse[]> {
  const response = await apiClient.get<OrderResponse[]>(`/orders/history`);
  return response.data;
}

// ---------- Recipient Interfaces ----------
export interface CreateRecipientRequest {
  name: string;
  accountNumber: string;
  bankCode: string;
}

export interface PaystackRecipient {
  id: number;
  recipientCode: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  currency: string;
  accountName: string; 
  bankName: string; 
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// ---------- Recipient API ----------
export async function createRecipient(req: CreateRecipientRequest): Promise<PaystackRecipient> {
  const response = await apiClient.post<PaystackRecipient>("/api/recipient/create", req);
  return response.data;
}

export async function getRecipient(): Promise<PaystackRecipient> {
  const response = await apiClient.get<PaystackRecipient>("/api/recipient/me");
  return response.data;
}

///////////////////////////////////////////////////////////////////////////////////////////
// ---------- Withdrawal Interfaces ----------

export interface WithdrawalRequest {
  userId: number;
  amount: number;
}

export interface WithdrawalResponse {
  id: number;                
  reference: string;         
  status: string;            
  amount: number;           
  recipient: string;         
  
}

// ---------- Withdrawal API ----------

export async function withdrawFunds(req: WithdrawalRequest): Promise<WithdrawalResponse> {
  const response = await apiClient.post<WithdrawalResponse>("/api/withdrawal", req);
  return response.data;
}

export async function verifyTransfer(transferId: string): Promise<any> {
  const response = await apiClient.get(`/api/withdrawal/transfers/${transferId}/verify`);
  return response.data;
}



export default apiClient;
