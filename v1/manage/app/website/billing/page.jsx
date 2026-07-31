"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Sidebar from "@/components/Sidebar";
import { BarcodeInput } from "@/components/Barcode";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  User,
  Phone,
  ShoppingBag,
  X,
  CreditCard,
  DollarSign,
  Percent,
  ArrowLeft,
  CheckCircle2,
  Layers,
  ChevronRight,
  QrCode,
  Store,
  Package,
  LayoutGrid,
  List,
  Clock,
  UserCheck,
  Cpu,
  BadgeCheck,
  History,
  ShoppingCart,
  Share2,
  FileDown,
  FileText,
  Smartphone,
  MessageCircle,
  Sparkles,
  Zap,
  RefreshCw,
  Lock,
  Shield,
  UserCheck2,
  ChevronDown,
  Users,
  UserPlus,
  Key,
  Check,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ChevronUp,
  LogOut,
  Unlock,
  Settings,
  Sliders,
  FileCheck,
  Save,
  MapPin,
  FileText as ReceiptIcon
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import WhatsAppRecoveryModal from "@/components/WhatsAppRecoveryModal";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL", "XXXL"];
const DEFAULT_CASHIERS = [
  { id: "usr-1", name: "Thilak", username: "ADMIN-01", pin: "1234", role: "admin", status: "active" },
  { id: "usr-2", name: "Prince", username: "MANAGER-01", pin: "7033769997", role: "admin", status: "active" },
  { id: "usr-3", name: "Rahul Kumar", username: "CASHIER-01", pin: "0000", role: "user", status: "active" },
  { id: "usr-4", name: "Anish Gupta", username: "CASHIER-02", pin: "1111", role: "user", status: "active" }
];

const STORE_BRANCHES = {
  patna: {
    id: "patna",
    name: "Patna Branch",
    storeName: "AESTHETX WAYS (PATNA)",
    storeAddress: "Kankarbagh Colony More, Ghrounda, Patna, Bihar 800001",
    phone: "+91 70337 69997",
    gstin: "10AAACA0000A1Z5"
  },
  gaya: {
    id: "gaya",
    name: "Gaya Branch",
    storeName: "AESTHETX WAYS (GAYA)",
    storeAddress: "Gaya Railway Station Campus Rd, Gol Bagicha, Gaya, Bihar 823002",
    phone: "+91 70337 69997",
    gstin: "10AAACA0000A1Z5"
  }
};

const DEFAULT_STORE_SETTINGS = {
  storeName: "AESTHETX WAYS (PATNA)",
  logoText: "AESTHETX WAYS",
  storeAddress: "Kankarbagh Colony More, Ghrounda, Patna, Bihar 800001",
  gstin: "10AAACA0000A1Z5",
  phone: "+91 70337 69997",
  thankYouMessage: "Thank you for shopping with us..!!",
  websiteUrl: "aesthetxways.com"
};

export default function NewBillingPage() {
  // Authentication & System State
  const [isInsysAuth, setIsInsysAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Store Branch Selection State ("patna" | "gaya")
  const [activeBranch, setActiveBranch] = useState("patna");

  // Registered Cashier & Staff Users
  const [registeredUsers, setRegisteredUsers] = useState(DEFAULT_CASHIERS);
  const [activeCashier, setActiveCashier] = useState(DEFAULT_CASHIERS[0]);
  const [showUserModal, setShowUserModal] = useState(false);

  // Store Billing & Thermal Receipt Settings State
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);

  // PIN Lock & Authentication State
  const [selectedUserForPin, setSelectedUserForPin] = useState(DEFAULT_CASHIERS[0]);
  const [enteredPin, setEnteredPin] = useState("");
  const [showPinCode, setShowPinCode] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Role-Based Access Control State ("admin" vs "user")
  const [userRole, setUserRole] = useState("admin"); // "admin" (everything) or "user" (billing only)

  // Hover / Click Expand Product State
  const [expandedProductId, setExpandedProductId] = useState(null);

  // New Cashier Form State (Name, Role, PIN only)
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    pin: "",
    role: "user"
  });

  // Create new Cashier User handler
  const handleCreateNewUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) {
      toast.error("Please enter Full Name");
      return;
    }
    if (!newUserForm.pin.trim()) {
      toast.error("Please enter 4-digit PIN code");
      return;
    }

    const autoUsername = "STAFF-" + String(registeredUsers.length + 1).padStart(2, "0");

    const newUser = {
      id: "usr-" + Date.now(),
      name: newUserForm.name.trim(),
      username: autoUsername,
      pin: newUserForm.pin.trim(),
      role: newUserForm.role,
      status: "active"
    };

    const updated = [...registeredUsers, newUser];
    saveUsersToStorage(updated);
    setNewUserForm({ name: "", pin: "", role: "user" });
    toast.success(`Created Account: ${newUser.name} (PIN: ${newUser.pin})`);
  };

  // Save Store Billing Settings Handler
  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("pos_store_settings", JSON.stringify(storeSettings));
    toast.success("Saved Store Billing & Thermal Receipt Settings!");
  };

  // POS Layout & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" });
  const [billNumber, setBillNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [recoveryModalData, setRecoveryModalData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  // Navigation Tabs & Billing History States
  const [activeTab, setActiveTab] = useState("billing"); // "billing" | "history" | "billing_products" | "settings"
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Quick Billing Product Form & Edit State (Asking Name & Price only)
  const [newBillingProductForm, setNewBillingProductForm] = useState({ name: "", price: "" });
  const [editingBillingProduct, setEditingBillingProduct] = useState(null);
  const [isSubmittingBillingProduct, setIsSubmittingBillingProduct] = useState(false);
  const [billingProductSearchQuery, setBillingProductSearchQuery] = useState("");

  // Load valid credentials from environment or defaults
  const VALID_CREDENTIALS = (() => {
    try {
      const envCreds = process.env.NEXT_PUBLIC_VALID_CREDENTIALS;
      if (envCreds) return JSON.parse(envCreds);
    } catch (e) {
      console.error("Failed to parse NEXT_PUBLIC_VALID_CREDENTIALS:", e);
    }
    return [
      { adminId: "Aesthetx Ways", password: "aesthetx123" },
      { adminId: "Thilak", password: "8008439762" },
      { adminId: "Prince", password: "7033769997" }
    ];
  })();

  // Auth & Saved Role / Users / Store Settings verification
  useEffect(() => {
    const authData = localStorage.getItem("insys_auth");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.isLoggedIn && parsed.storeType) {
          setIsInsysAuth(true);
        }
      } catch (e) {
        console.error("Error parsing insys_auth", e);
      }
    }

    const savedRole = localStorage.getItem("pos_user_role");
    if (savedRole === "user" || savedRole === "admin") {
      setUserRole(savedRole);
    }

    const savedUsers = localStorage.getItem("pos_registered_users");
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((u) => {
            if (u.name === "Admin Terminal") return DEFAULT_CASHIERS[0];
            return u;
          });
          setRegisteredUsers(cleaned);
          setActiveCashier(cleaned[0]);
          setSelectedUserForPin(cleaned[0]);
          localStorage.setItem("pos_registered_users", JSON.stringify(cleaned));
        }
      } catch (e) {
        console.error("Failed to parse saved cashier users", e);
      }
    } else {
      localStorage.setItem("pos_registered_users", JSON.stringify(DEFAULT_CASHIERS));
    }

    const savedBranch = localStorage.getItem("pos_active_branch");
    const initialBranchKey = (savedBranch === "gaya" || savedBranch === "patna") ? savedBranch : "patna";
    setActiveBranch(initialBranchKey);
    const branchInfo = STORE_BRANCHES[initialBranchKey] || STORE_BRANCHES.patna;

    const savedStoreSettings = localStorage.getItem("pos_store_settings");
    if (savedStoreSettings) {
      try {
        const parsed = JSON.parse(savedStoreSettings);
        if (parsed && typeof parsed === "object") {
          const merged = { ...DEFAULT_STORE_SETTINGS, ...parsed };
          merged.storeAddress = branchInfo.storeAddress;
          merged.storeName = branchInfo.storeName;
          merged.phone = "+91 70337 69997";
          setStoreSettings(merged);
          localStorage.setItem("pos_store_settings", JSON.stringify(merged));
        }
      } catch (e) {
        console.error("Failed to parse store settings", e);
      }
    } else {
      const initialSettings = { ...DEFAULT_STORE_SETTINGS, storeName: branchInfo.storeName, storeAddress: branchInfo.storeAddress };
      setStoreSettings(initialSettings);
      localStorage.setItem("pos_store_settings", JSON.stringify(initialSettings));
    }

    setAuthChecked(true);
  }, []);

  // Handle switching store branches (Patna vs Gaya)
  const handleBranchChange = (branchId) => {
    setActiveBranch(branchId);
    localStorage.setItem("pos_active_branch", branchId);
    const branchInfo = STORE_BRANCHES[branchId] || STORE_BRANCHES.patna;
    const updatedSettings = {
      ...storeSettings,
      storeName: branchInfo.storeName,
      storeAddress: branchInfo.storeAddress
    };
    setStoreSettings(updatedSettings);
    localStorage.setItem("pos_store_settings", JSON.stringify(updatedSettings));
    toast.success(`Switched POS to ${branchInfo.storeName}`);
  };

  // Handle PIN Verification Submission (Just PIN!)
  const handleVerifyPinSubmit = (e) => {
    e.preventDefault();
    const trimmedPin = enteredPin.trim();
    if (!trimmedPin) {
      toast.error("Please enter Security PIN code");
      return;
    }

    setIsVerifyingPin(true);
    setTimeout(() => {
      // Check if PIN matches an admin master PIN ("1234", "8008439762", "aesthetx123", "7033769997")
      const isAdminMasterPin = ["1234", "8008439762", "aesthetx123", "7033769997"].includes(trimmedPin);

      // Check if PIN matches any registered cashier user account
      const matchedUser = registeredUsers.find((u) => u.pin === trimmedPin);

      if (isAdminMasterPin || matchedUser) {
        const activeUser = matchedUser || registeredUsers.find((u) => u.role === "admin") || registeredUsers[0];
        const finalRole = (isAdminMasterPin || activeUser.role === "admin") ? "admin" : "user";

        setUserRole(finalRole);
        localStorage.setItem("pos_user_role", finalRole);
        setActiveCashier(activeUser);

        // Save auth to localStorage
        localStorage.setItem(
          "insys_auth",
          JSON.stringify({
            isLoggedIn: true,
            storeType: "website",
            loginTime: new Date().toISOString(),
            user: activeUser.name
          })
        );

        setIsInsysAuth(true);
        setEnteredPin("");

        if (finalRole === "admin") {
          toast.success(`Welcome ${activeUser.name}! ADMIN Mode Unlocked (Full Access)`);
        } else {
          setActiveTab("billing");
          setDiscount(0);
          toast.success(`Welcome ${activeUser.name}! CASHIER Mode Active (Generate Bills Only)`);
        }
      } else {
        toast.error("Invalid Security PIN Code");
      }
      setIsVerifyingPin(false);
    }, 400);
  };

  // Lock Terminal Handler
  const handleLockTerminal = () => {
    setIsInsysAuth(false);
    setEnteredPin("");
    toast.success("Terminal Locked. Enter PIN to unlock.");
  };

  // Save registered users helper
  const saveUsersToStorage = (updatedUsers) => {
    setRegisteredUsers(updatedUsers);
    localStorage.setItem("pos_registered_users", JSON.stringify(updatedUsers));
  };

  // Delete Cashier User
  const handleDeleteUser = (userId) => {
    if (registeredUsers.length <= 1) {
      toast.error("Cannot delete the only remaining user account!");
      return;
    }
    const updated = registeredUsers.filter((u) => u.id !== userId);
    saveUsersToStorage(updated);
    if (activeCashier.id === userId) {
      setActiveCashier(updated[0]);
    }
    toast.success("Cashier account removed");
  };

  // Sync Role changes
  const toggleUserRole = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem("pos_user_role", newRole);
    if (newRole === "user") {
      setActiveTab("billing");
      setDiscount(0);
      const cashierUser = registeredUsers.find((u) => u.role === "user") || registeredUsers[0];
      setActiveCashier(cashierUser);
      toast.success(`Switched to CASHIER Mode (${cashierUser.name})`);
    } else {
      const adminUser = registeredUsers.find((u) => u.role === "admin") || registeredUsers[0];
      setActiveCashier(adminUser);
      toast.success("Switched to ADMIN Mode (Full Access)");
    }
  };

  // Convex Queries & Mutations
  const products = useQuery(api.inventory.getWebsiteProductsForBilling, {});
  const createBill = useMutation(api.inventory.createWebsitePOSBill);
  const billsHistory = useQuery(api.inventory.getBillingHistory, { limit: 100 }) || [];

  // Billing Products Queries & Mutations (Dedicated billing DB)
  const billingProductsData = useQuery(api.billingProducts.getBillingProducts, {}) || [];
  const createBillingProductMutation = useMutation(api.billingProducts.createBillingProduct);
  const updateBillingProductMutation = useMutation(api.billingProducts.updateBillingProduct);
  const deleteBillingProductMutation = useMutation(api.billingProducts.deleteBillingProduct);

  // Handler to Create or Update Billing Product (Asking Name & Price only)
  const handleSaveBillingProduct = async (e) => {
    e.preventDefault();
    if (!newBillingProductForm.name.trim()) {
      toast.error("Please enter product name");
      return;
    }
    const numPrice = parseFloat(newBillingProductForm.price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmittingBillingProduct(true);
    try {
      if (editingBillingProduct) {
        await updateBillingProductMutation({
          id: editingBillingProduct._id,
          name: newBillingProductForm.name,
          price: numPrice,
        });
        toast.success(`Updated "${newBillingProductForm.name}" successfully!`);
        setEditingBillingProduct(null);
      } else {
        await createBillingProductMutation({
          name: newBillingProductForm.name,
          price: numPrice,
          createdBy: activeCashier?.name || "Admin",
        });
        toast.success(`Added "${newBillingProductForm.name}" to Billing Products!`);
      }
      setNewBillingProductForm({ name: "", price: "" });
    } catch (err) {
      toast.error(err.message || "Failed to save billing product");
    } finally {
      setIsSubmittingBillingProduct(false);
    }
  };

  const handleStartEditBillingProduct = (bp) => {
    setEditingBillingProduct(bp);
    setNewBillingProductForm({ name: bp.name, price: bp.price.toString() });
  };

  const handleCancelEditBillingProduct = () => {
    setEditingBillingProduct(null);
    setNewBillingProductForm({ name: "", price: "" });
  };

  const handleDeleteBillingProduct = async (bpId, bpName) => {
    if (!confirm(`Are you sure you want to delete "${bpName}"?`)) return;
    try {
      await deleteBillingProductMutation({ id: bpId });
      toast.success(`Deleted "${bpName}"`);
      if (editingBillingProduct?._id === bpId) {
        handleCancelEditBillingProduct();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  // Handle adding custom billing product directly to cart (no size needed)
  const handleAddBillingProductToCart = (product, e) => {
    if (e) e.stopPropagation();
    const cartKey = `bp-${product._id}`;
    const existingIndex = cart.findIndex((item) => item.cartKey === cartKey);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
      toast.success(`Updated ${product.name} qty`, { duration: 1500 });
    } else {
      setCart([
        ...cart,
        {
          cartKey,
          productId: product._id,
          productName: product.name,
          productImage: null,
          itemId: product.itemId || "BP-0001",
          size: "",
          price: product.price || 0,
          quantity: 1,
          maxStock: 9999,
          isBillingProduct: true,
        }
      ]);
      toast.success(`Added ${product.name} to cart`, { duration: 1500 });
    }
  };

  // Filter billing history
  const filteredBills = billsHistory.filter((bill) => {
    const query = historySearchQuery.toLowerCase();
    return (
      bill.billNumber?.toLowerCase().includes(query) ||
      bill.customerName?.toLowerCase().includes(query) ||
      bill.customerPhone?.toLowerCase().includes(query) ||
      bill.createdBy?.toLowerCase().includes(query)
    );
  });

  // Filter custom billing products tab list
  const filteredBillingProductsList = billingProductsData.filter((bp) => {
    const query = billingProductSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      bp.name?.toLowerCase().includes(query) ||
      bp.itemId?.toLowerCase().includes(query)
    );
  });

  // Sync current clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate unique bill number on load
  useEffect(() => {
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setBillNumber(generated);
  }, []);

  // Combine main website catalog products and quick billing products for the main POS Billing tab
  const allProducts = [
    ...(products || []),
    ...(billingProductsData || []).map((bp) => ({
      _id: bp._id,
      itemId: bp.itemId,
      name: bp.name,
      price: bp.price,
      category: bp.category || "Quick Billing",
      isBillingProduct: true,
      availableSizes: ["Standard"],
      sizeStock: { Standard: 9999 },
    })),
  ];

  // Filter combined products by search query
  const filteredProducts = allProducts.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      product.name?.toLowerCase().includes(query) ||
      product.itemId?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  // Handle adding product with specific size directly to cart
  const handleAddToCart = (product, size, e) => {
    if (e) e.stopPropagation();
    const availableStock = product.sizeStock?.[size] || 0;
    if (availableStock <= 0) {
      toast.error(`Size ${size} is out of stock!`);
      return;
    }

    const cartKey = `${product._id}-${size}`;
    const existingIndex = cart.findIndex((item) => item.cartKey === cartKey);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > availableStock) {
        toast.error(`Only ${availableStock} units available for size ${size}!`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
      toast.success(`Updated ${product.name} (${size}) qty`, { duration: 1500 });
    } else {
      setCart([
        ...cart,
        {
          cartKey,
          productId: product._id,
          productName: product.name,
          productImage: product.mainImage || product.images?.[0] || null,
          itemId: product.itemId || "ITEM-001",
          size: size,
          price: product.price || 0,
          quantity: 1,
          maxStock: availableStock,
          sizeDisplayType: product.sizeDisplayType || "letter"
        }
      ]);
      toast.success(`Added ${product.name} (${size}) to cart`, { duration: 1500 });
    }
  };

  // Quantity modification in Cart
  const updateQuantity = (cartKey, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.cartKey === cartKey) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              toast.error(`Maximum available stock reached (${item.maxStock})`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartKey !== cartKey));
  };

  // Billing Math Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const effectiveDiscount = userRole === "admin" ? discount : 0;
  const discountAmount = Math.round((subtotal * (effectiveDiscount / 100)) * 100) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgst = 0;
  const sgst = 0;
  const tax = 0;
  const totalWithTax = taxableAmount;
  const grandTotal = Math.round(totalWithTax);
  const roundOff = Math.round((grandTotal - totalWithTax) * 100) / 100;

  // Magnet Club & Restro Thermal Invoice Print Handler (80mm Thermal Receipt Engine)
  const executeMagnetRestroPrint = async (targetBill = null) => {
    const activeBillData = targetBill || {
      billNumber: billNumber,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      items: cart,
      subtotal: subtotal,
      discount: effectiveDiscount,
      discountAmount: discountAmount,
      cgst: cgst,
      sgst: sgst,
      tax: tax,
      total: grandTotal,
      roundOff: roundOff,
      paymentMethod: paymentMethod,
      createdBy: activeCashier ? activeCashier.name : "POS Cashier",
      createdAt: new Date().toISOString()
    };

    const printWindow = window.open("", "_blank", "width=450,height=800");
    if (!printWindow) {
      toast.error("Please allow popups to enable bill printing!");
      return;
    }

    const itemsQty = activeBillData.items.reduce((sum, i) => sum + i.quantity, 0);
    const billSubtotal = activeBillData.subtotal || activeBillData.total || 0;
    const billCgst = activeBillData.cgst ?? Math.round((billSubtotal * 0.025) * 100) / 100;
    const billSgst = activeBillData.sgst ?? Math.round((billSubtotal * 0.025) * 100) / 100;
    const billRoundOff = activeBillData.roundOff ?? 0;
    const roundOffStr = billRoundOff >= 0 ? `+₹${billRoundOff.toFixed(2)}` : `-₹${Math.abs(billRoundOff).toFixed(2)}`;
    const formattedDate = new Date(activeBillData.createdAt || Date.now()).toLocaleDateString("en-GB");
    const formattedTime = new Date(activeBillData.createdAt || Date.now()).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const rawCashierLabel = activeBillData.createdBy || (activeCashier ? activeCashier.name : "POS Cashier");
    const cashierLabel = rawCashierLabel.replace(/\s*\([^)]*\)/g, "").trim();

    // Dynamic Store Branch Details (Patna vs Gaya)
    const currentBranch = STORE_BRANCHES[activeBranch] || STORE_BRANCHES.patna;
    const storeTitle = targetBill?.storeName || storeSettings?.storeName || currentBranch.storeName;
    const logoBadge = storeSettings?.logoText || "AESTHETX WAYS";
    const storeAddr = targetBill?.storeAddress || storeSettings?.storeAddress || currentBranch.storeAddress;
    const storeGstin = storeSettings?.gstin || "10AAACA0000A1Z5";
    const storePhone = storeSettings?.phone || "+91 70337 69997";
    const thankMsg = storeSettings?.thankYouMessage || "Thank you for shopping with us..!!";
    const siteUrl = storeSettings?.websiteUrl || "aesthetxways.com";

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Bill - #${activeBillData.billNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 6mm 2mm; 
              background: #fff; 
              color: #000; 
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .brand { text-align: center; margin-bottom: 10px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .brand-logo-text { display: inline-block; padding: 3px 12px; background: #000; color: #fff; font-size: 14px; font-weight: 900; border-radius: 4px; margin-bottom: 4px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
            .brand-name { font-size: 16px; font-weight: 900; letter-spacing: 1px; margin: 4px 0 2px 0; text-transform: uppercase; color: #000; }
            .brand-address, .brand-phone, .brand-gst { font-size: 11px; margin: 2px 0; color: #000; font-weight: 700; line-height: 1.4; }
            .brand-gst { font-size: 11px; font-weight: 900; }
            .metadata { font-size: 11px; border-bottom: 1.5px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
            .meta-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .meta-label { font-weight: 800; color: #000; }
            .meta-value { font-weight: 800; color: #000; }
            .meta-value.bold { font-size: 12px; font-weight: 900; }
            .font-mono { font-family: monospace; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .items-table th { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #000; border-top: 1.5px dashed #000; border-bottom: 1.5px dashed #000; padding: 6px 0; }
            .items-table td { padding: 5px 0; font-size: 11px; font-weight: 700; vertical-align: top; color: #000; border-bottom: 0.5px dashed #000; }
            .align-left { text-align: left; }
            .align-center { text-align: center; }
            .align-right { text-align: right; }
            .totals-section { border-top: 1.5px dashed #000; border-bottom: 1.5px dashed #000; padding: 8px 0; margin-bottom: 10px; }
            .grand-total-row td { border-top: 1.5px dashed #000; padding-top: 8px; font-weight: 900; }
            .receipt-footer { text-align: center; margin-top: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .payment-badge { display: inline-block; border: 2px solid #000; padding: 4px 14px; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; margin-bottom: 8px; text-transform: uppercase; border-radius: 4px; }
            .thank-you { font-size: 11px; font-weight: 700; font-style: italic; margin: 4px 0 2px 0; color: #000; }
            .website { font-size: 10px; font-weight: 800; margin: 4px 0 2px 0; color: #000; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4; }
            @media print { body { width: 72mm; margin: 0 auto; padding: 6mm 2mm; box-sizing: border-box; } }
          </style>
        </head>
        <body onload="window.print(); setTimeout(function(){ window.close(); }, 500);">
          <div class="brand">
            <img src="/logo_t.svg" alt="AESTHETX WAYS" style="width: 85px; height: auto; margin: 0 auto 6px auto; display: block;" />
            <h1 class="brand-name">${storeTitle}</h1>
            <p class="brand-address">${storeAddr}</p>
            <p class="brand-phone">Support: ${storePhone}</p>
          </div>
          
          <div class="metadata">
            <div class="meta-row">
              <span class="meta-label">Date & Time:</span>
              <span class="meta-value">${formattedDate} ${formattedTime}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Bill No.:</span>
              <span class="meta-value font-mono bold">${activeBillData.billNumber}</span>
            </div>
            ${activeBillData.customerName ? `
            <div class="meta-row">
              <span class="meta-label">Customer:</span>
              <span class="meta-value">${activeBillData.customerName}</span>
            </div>` : ''}
            ${activeBillData.customerPhone ? `
            <div class="meta-row">
              <span class="meta-label">Phone:</span>
              <span class="meta-value font-mono">${activeBillData.customerPhone}</span>
            </div>` : ''}
            <div class="meta-row">
              <span class="meta-label">Partner:</span>
              <span class="meta-value">${cashierLabel}</span>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="align-left" style="width: 8%;">#</th>
                <th class="align-left" style="width: 56%;">Item</th>
                <th class="align-center" style="width: 14%;">Qty</th>
                <th class="align-right" style="width: 22%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${activeBillData.items.map((item, idx) => `
                <tr>
                  <td class="align-left">${idx + 1}</td>
                  <td class="align-left">
                    ${item.productName || item.name} 
                    ${item.size && item.size !== "Standard" ? `<br/><span style="font-size: 9px; opacity: 0.8; font-family: monospace;">Size: ${item.size}</span>` : ''}
                  </td>
                  <td class="align-center">${item.quantity}</td>
                  <td class="align-right font-mono">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #000; font-weight: 700;">
              <tr>
                <td style="text-align: left; font-weight: 800; padding: 2px 0;">Total Qty: ${itemsQty}</td>
                <td style="text-align: right; width: 45%; padding: 2px 0;">Sub Total</td>
                <td style="text-align: right; width: 25%; padding: 2px 0;" class="font-mono">₹${billSubtotal.toFixed(2)}</td>
              </tr>
              ${activeBillData.discountAmount > 0 ? `
              <tr>
                <td></td>
                <td style="text-align: right; padding: 2px 0;">Discount (${activeBillData.discount}%)</td>
                <td style="text-align: right; padding: 2px 0;" class="font-mono">-₹${activeBillData.discountAmount.toFixed(2)}</td>
              </tr>` : ''}
              ${billRoundOff !== 0 ? `
              <tr style="font-size: 10px;">
                <td></td>
                <td style="text-align: right; padding: 2px 0;">Round off</td>
                <td style="text-align: right; padding: 2px 0;" class="font-mono">${roundOffStr}</td>
              </tr>` : ''}
              <tr class="grand-total-row">
                <td colspan="2" style="text-align: right; font-weight: 900; font-size: 14px; padding-top: 6px; border-top: 1.5px dashed #000;">Grand Total</td>
                <td style="text-align: right; font-weight: 900; font-size: 14px; padding-top: 6px; border-top: 1.5px dashed #000;" class="font-mono">₹${(activeBillData.total || activeBillData.grandTotal).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="receipt-footer">
            <div class="payment-badge">
              PAID VIA ${(activeBillData.paymentMethod || 'CASH').toUpperCase()}
            </div>
            <p class="thank-you">${thankMsg}</p>
            <p class="website">Visit Our Store Online<br/>${siteUrl}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Submit and Save Bill POS Transaction
  const handleProcessBillAndPrint = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty! Add products before billing.");
      return;
    }

    const cleanPhone = (customerInfo.phone || "").replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("Customer Phone Number is required!");
      return;
    }
    if (cleanPhone.length !== 10) {
      toast.error("Customer Phone Number must be exactly 10 digits!");
      return;
    }

    if (!customerInfo.name?.trim()) {
      toast.error("Customer Name is required!");
      return;
    }

    const cashierNameStr = activeCashier ? activeCashier.name : "POS Cashier";

    const toastId = toast.loading("Processing POS bill & updating stock...");
    try {
      const cleanItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage || undefined,
        itemId: item.itemId,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        sizeDisplayType: item.sizeDisplayType || "letter"
      }));

      const result = await createBill({
        billNumber: String(Math.floor(Number(billNumber) || 100000)),
        items: cleanItems,
        customerName: customerInfo.name || undefined,
        customerPhone: customerInfo.phone || undefined,
        subtotal: subtotal,
        discount: effectiveDiscount,
        discountAmount: discountAmount,
        tax: tax,
        total: grandTotal,
        paymentMethod: paymentMethod,
        createdBy: cashierNameStr
      });

      toast.success("Bill processed & inventory updated!", { id: toastId });

      // Trigger Thermal Invoice Print Window
      executeMagnetRestroPrint({
        billNumber: result.billNumber || billNumber,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: cart,
        subtotal: subtotal,
        discount: effectiveDiscount,
        discountAmount: discountAmount,
        cgst: cgst,
        sgst: sgst,
        tax: tax,
        total: grandTotal,
        roundOff: roundOff,
        paymentMethod: paymentMethod,
        createdBy: cashierNameStr,
        createdAt: new Date().toISOString()
      });

      // Reset Form State for next customer
      setCart([]);
      setCustomerInfo({ name: "", phone: "" });
      setDiscount(0);
      setPaymentMethod("cash");
      const nextBillNum = String(Math.floor(100000 + Math.random() * 900000));
      setBillNumber(nextBillNum);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process bill: " + (err.message || "Server Error"), { id: toastId });
    }
  };

  if (!authChecked) {
    return (
      <div className="flex h-screen bg-white items-center justify-center font-mono text-xs text-zinc-500">
        Loading POS Billing System...
      </div>
    );
  }

  // If Terminal is Locked / Unauthenticated -> Show Inline User + PIN Verification Screen directly on the page
  if (!isInsysAuth) {
    return (
      <div className="flex h-screen bg-zinc-50/50 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white rounded-xs border border-zinc-200 p-6 shadow-xl font-mono text-xs"
          >
            {/* Header / Logo */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-zinc-950 text-white rounded-xs flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Lock size={22} />
              </div>
              <h2 className="font-sans font-bold text-lg text-zinc-950">POS Terminal Locked</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Enter your security PIN code to unlock
              </p>
            </div>

            {/* PIN Verification Form (Only PIN!) */}
            <form onSubmit={handleVerifyPinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-1.5">
                  Security PIN Code
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPinCode ? "text" : "password"}
                    maxLength={10}
                    required
                    autoFocus
                    placeholder="Enter PIN (e.g. 1234 or 0000)..."
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-zinc-50 border border-zinc-200 rounded-xs text-zinc-900 font-bold text-center tracking-widest text-sm focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinCode(!showPinCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showPinCode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingPin}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                {isVerifyingPin ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying PIN...</span>
                  </>
                ) : (
                  <>
                    <Unlock size={14} />
                    <span>UNLOCK TERMINAL</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-150 space-y-1 text-[10px] text-zinc-400 text-center">
              <p>
                <span className="font-bold text-zinc-700">Admin PIN:</span> 1234 (Full Access)
              </p>
              <p>
                <span className="font-bold text-zinc-700">Cashier PIN:</span> 0000 / 1111 (Generate Bills Only)
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50/50 overflow-hidden">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar with RBAC & Active Cashier Switcher */}
        <header className="bg-white border-b border-zinc-150 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-zinc-900 font-sans tracking-tight">POS Billing Desk</h1>
                {userRole === "admin" ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
                    <Shield size={10} />
                    <span>ADMIN</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-mono font-bold border border-blue-200 flex items-center gap-1">
                    <UserCheck2 size={10} />
                    <span>CASHIER</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Terminal #{billNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Store Branch Switcher (Patna vs Gaya) */}
            <div className="flex items-center p-0.5 bg-zinc-100 rounded-xs border border-zinc-200 font-mono text-xs">
              <button
                onClick={() => handleBranchChange("patna")}
                className={`px-2.5 py-1 rounded-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeBranch === "patna"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
                title="Patna Store Branch"
              >
                <MapPin size={11} />
                <span>Patna Store</span>
              </button>
              <button
                onClick={() => handleBranchChange("gaya")}
                className={`px-2.5 py-1 rounded-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeBranch === "gaya"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
                title="Gaya Store Branch (Waves)"
              >
                <MapPin size={11} />
                <span>Gaya Store</span>
              </button>
            </div>

            {/* Lock Terminal Button */}
            <button
              onClick={handleLockTerminal}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-red-50 hover:text-red-700 text-zinc-700 rounded-xs text-xs font-mono font-bold border border-zinc-200 hover:border-red-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Lock Terminal & Re-enter PIN"
            >
              <Lock size={12} />
              <span>Lock</span>
            </button>

            {/* Admin User Management Button (Admin Only) */}
            {userRole === "admin" && (
              <button
                onClick={() => setShowUserModal(true)}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xs text-xs font-mono font-bold border border-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Manage Cashier Users"
              >
                <Users size={13} className="text-zinc-600" />
                <span>Manage Users ({registeredUsers.length})</span>
              </button>
            )}

            {/* Tab Switcher: Billing Desk vs History vs Settings */}
            <div className="flex items-center p-0.5 bg-zinc-100 rounded-xs border border-zinc-200 font-mono text-xs">
              <button
                onClick={() => setActiveTab("billing")}
                className={`px-3 py-1 rounded-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "billing"
                    ? "bg-white text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <ShoppingCart size={13} />
                <span>Billing Desk</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 rounded-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <History size={13} />
                <span>Bill History ({billsHistory.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("billing_products")}
                className={`px-3 py-1 rounded-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "billing_products"
                    ? "bg-white text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Package size={13} />
                <span>Billing Products ({billingProductsData.length})</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab 1: Billing Desk (POS View) */}
        {activeTab === "billing" && (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Column: Inventory Search & Product Expandable List */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-150 bg-white">
              {/* Product Search Bar */}
              <div className="p-3 border-b border-zinc-150 bg-zinc-50/50 flex items-center gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by product title, category, or Item ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xs text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Active Cashier Static Name Display */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase hidden lg:inline">Cashier:</span>
                  <span className="px-2.5 py-1 bg-white border border-zinc-200 rounded-xs text-[11px] font-bold text-zinc-900 shadow-2xs">
                    {activeCashier ? activeCashier.name : "Admin"}
                  </span>
                </div>
              </div>

              {/* Product Expandable List UI (No images upfront, expands on hover/click) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {products === undefined ? (
                  <div className="py-16 text-center font-mono text-xs text-zinc-400 flex flex-col items-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-zinc-400" />
                    <span>Syncing catalog products...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-16 text-center font-mono text-xs text-zinc-400">
                    No products found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const sizeStockTotal = product.sizeStock
                      ? Object.values(product.sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0)
                      : 0;
                    const totalStock = sizeStockTotal > 0 ? sizeStockTotal : (product.totalAvailable ?? product.currentStock ?? 0);
                    const hasStock = totalStock > 0;
                    const isExpanded = expandedProductId === product._id;

                    return (
                      <div
                        key={product._id}
                        onMouseEnter={() => setExpandedProductId(product._id)}
                        onClick={() => setExpandedProductId(isExpanded ? null : product._id)}
                        className={`bg-white border rounded-xs transition-all duration-200 overflow-hidden font-mono text-xs cursor-pointer ${
                          isExpanded
                            ? "border-zinc-900 shadow-md ring-1 ring-zinc-900/10 p-3 bg-white"
                            : "border-zinc-200 hover:border-zinc-400 p-2.5 hover:bg-zinc-50/60"
                        } ${!hasStock ? "opacity-60 bg-zinc-50" : ""}`}
                      >
                        {/* Collapsed Compact Row Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${product.isBillingProduct ? "bg-purple-600" : "bg-zinc-900"}`} />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-sans font-bold text-xs text-zinc-950 truncate flex items-center gap-2">
                                <span>{product.name}</span>
                                {product.isBillingProduct && (
                                  <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-mono rounded-xs font-bold border border-purple-200">
                                    Quick Item
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                                <span>ID: {product.itemId || "N/A"}</span>
                                {product.category && <span>• {product.category}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Stock status pill / Quick Item badge */}
                            {product.isBillingProduct ? (
                              <button
                                onClick={(e) => handleAddBillingProductToCart(product, e)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xs text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Plus size={12} />
                                <span>Add to Bill</span>
                              </button>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${
                                hasStock
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {hasStock ? `${totalStock} in stock` : "Out of Stock"}
                              </span>
                            )}

                            {/* Price */}
                            <span className="font-bold text-sm text-zinc-950">
                              ₹{product.price}
                            </span>

                            {!product.isBillingProduct && (
                              <div className="text-zinc-400">
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded State: Reveals Product Image & Inline Sizes (Main store products only) */}
                        <AnimatePresence>
                          {isExpanded && !product.isBillingProduct && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-zinc-150 flex flex-col sm:flex-row gap-3 items-start"
                            >
                              {/* Product Thumbnail Image */}
                              <div className="w-20 h-20 bg-zinc-100 rounded-xs border border-zinc-200 overflow-hidden shrink-0">
                                {product.mainImage || product.images?.[0] ? (
                                  <img
                                    src={product.mainImage || product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <Package size={20} />
                                  </div>
                                )}
                              </div>

                              {/* Size Stock Selector Buttons */}
                              <div className="flex-1 w-full">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5">
                                  Click size variant to add directly to cart:
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                                  {SIZE_ORDER.map((size) => {
                                    const stock = product.sizeStock?.[size] || 0;
                                    const isAvailable = stock > 0;

                                    return (
                                      <button
                                        key={size}
                                        disabled={!isAvailable}
                                        onClick={(e) => handleAddToCart(product, size, e)}
                                        className={`py-1.5 px-2 rounded-xs border text-center transition-all flex flex-col items-center justify-center ${
                                          isAvailable
                                            ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 active:scale-95 cursor-pointer shadow-xs"
                                            : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-50"
                                        }`}
                                      >
                                        <span className="font-bold text-xs">{size}</span>
                                        <span className={`text-[9px] mt-0.5 font-normal ${isAvailable ? "text-emerald-300 font-bold" : "text-red-400"}`}>
                                          {isAvailable ? `${stock} left` : "0"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Live Shopping Cart & Billing Calculation */}
            <div className="w-80 md:w-96 bg-white border-l border-zinc-150 flex flex-col shrink-0">
              <div className="p-3 border-b border-zinc-150 bg-zinc-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={15} className="text-zinc-700" />
                  <h2 className="text-xs font-bold text-zinc-900 uppercase font-mono tracking-wider">
                    Order Cart ({cart.length})
                  </h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[10px] font-mono text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Clear Cart</span>
                  </button>
                )}
              </div>

              {/* Customer Phone & Name Input */}
              <div className="p-3 border-b border-zinc-150 bg-white grid grid-cols-2 gap-2 text-xs font-mono shrink-0">
                <div>
                  <label className="text-[10px] text-zinc-500 font-semibold uppercase block mb-1">
                    Customer Phone <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="10 digit phone *"
                      value={customerInfo.phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setCustomerInfo({ ...customerInfo, phone: digitsOnly });
                      }}
                      className="w-full pl-7 pr-2 py-1 bg-zinc-50 border border-zinc-200 rounded-xs text-[11px] text-zinc-900 focus:outline-none focus:border-zinc-400 font-bold font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-semibold uppercase block mb-1">
                    Customer Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Full name *"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full pl-7 pr-2 py-1 bg-zinc-50 border border-zinc-200 rounded-xs text-[11px] text-zinc-900 focus:outline-none focus:border-zinc-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-3 divide-y divide-zinc-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 font-mono text-xs text-zinc-400">
                    <ShoppingBag size={28} className="text-zinc-300 mb-2" />
                    <p className="font-semibold text-zinc-500">Cart is Empty</p>
                    <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">
                      Hover or click any product on the left and select a size to add items to cart.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartKey} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-sans font-medium text-zinc-900 truncate">{item.productName}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                          <span className="px-1 bg-zinc-100 border border-zinc-200 rounded-xs font-bold text-zinc-800">
                            Size: {item.size}
                          </span>
                          <span>₹{item.price} each</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center border border-zinc-200 rounded-xs bg-zinc-50">
                          <button
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            className="p-1 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center font-bold text-zinc-900 text-[11px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, 1)}
                            className="p-1 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="w-14 text-right font-bold text-zinc-900 text-[11px]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount & Payment Method Controls */}
              <div className="p-3 border-t border-zinc-150 bg-zinc-50/50 space-y-2.5 shrink-0 font-mono text-xs">
                {/* Discount % (Admin Only Control) */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                    <span>Discount:</span>
                    {userRole === "user" && <span className="text-[9px] text-zinc-400">(Admin only)</span>}
                  </span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15, 20].map((d) => (
                      <button
                        key={d}
                        disabled={userRole !== "admin"}
                        onClick={() => setDiscount(d)}
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] border transition-all ${
                          effectiveDiscount === d
                            ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                        } ${userRole !== "admin" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {d === 0 ? "None" : `${d}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <span className="text-zinc-600 text-[10px] font-semibold uppercase block mb-1">
                    Payment Method
                  </span>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {[
                      { id: "cash", label: "CASH" },
                      { id: "upi", label: "UPI" },
                      { id: "card", label: "CARD" },
                      { id: "netbanking", label: "NET" }
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`py-1 rounded-xs border font-bold transition-all text-center cursor-pointer ${
                          paymentMethod === pm.id
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Math Summary Table */}
                <div className="pt-2 border-t border-zinc-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {effectiveDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({effectiveDiscount}%):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {roundOff !== 0 && (
                    <div className="flex justify-between text-zinc-400 text-[10px]">
                      <span>Round Off:</span>
                      <span>{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-zinc-950 pt-1.5 border-t border-zinc-200">
                    <span>Grand Total:</span>
                    <span className="text-base text-zinc-950 font-mono">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Process & Print Magnet Restro Invoice Button */}
                <button
                  onClick={handleProcessBillAndPrint}
                  disabled={cart.length === 0}
                  className={`w-full py-2.5 px-4 rounded-xs text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    cart.length > 0
                      ? "bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer active:scale-[0.99]"
                      : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  <Printer size={15} />
                  <span>PROCESS & PRINT THERMAL INVOICE</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Billing History & Search */}
        {activeTab === "history" && (
          <div className="flex-1 p-4 overflow-y-auto bg-zinc-50/50 font-mono">
            <div className="max-w-6xl mx-auto space-y-4">
              {/* History Search Header */}
              <div className="bg-white p-3 rounded-xs border border-zinc-150 shadow-xs flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search history by Bill #, Customer Name, Phone, or Cashier..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xs text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  Total Bills Recorded: <span className="font-bold text-zinc-900">{billsHistory.length}</span>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-xs border border-zinc-150 overflow-hidden shadow-xs">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-150 text-[10px] uppercase text-zinc-500">
                    <tr>
                      <th className="p-3">Bill Number</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Cashier Staff</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Grand Total</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-zinc-400">
                          No bill history matches your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill) => {
                        const itemsCount = (bill.items || []).reduce((sum, i) => sum + i.quantity, 0);
                        const formattedDate = new Date(bill.createdAt || bill._creationTime).toLocaleDateString("en-GB");
                        const formattedTime = new Date(bill.createdAt || bill._creationTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit"
                        });

                        return (
                          <tr key={bill._id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-3 font-bold text-zinc-950">{bill.billNumber}</td>
                            <td className="p-3 text-zinc-500 text-[11px]">
                              {formattedDate} {formattedTime}
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded-xs border border-zinc-200 text-[11px]">
                                {bill.createdBy || "POS Cashier"}
                              </span>
                            </td>
                            <td className="p-3">
                              {bill.customerName || bill.customerPhone ? (
                                <div>
                                  <div className="font-medium text-zinc-900">{bill.customerName || "Guest"}</div>
                                  <div className="text-[10px] text-zinc-400">{bill.customerPhone || "No Phone"}</div>
                                </div>
                              ) : (
                                <span className="text-zinc-400 italic">Walk-in Guest</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 rounded-xs text-[10px] font-bold uppercase border border-zinc-200">
                                {bill.paymentMethod || "cash"}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-zinc-950">₹{(bill.total || 0).toFixed(2)}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => executeMagnetRestroPrint(bill)}
                                  className="px-2.5 py-1 bg-zinc-900 text-white rounded-xs text-[10px] font-mono hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                                  title="Reprint Magnet Restro Thermal Bill"
                                >
                                  <Printer size={12} />
                                  <span>Reprint</span>
                                </button>
                                {bill.customerPhone && (
                                  <button
                                    onClick={() => setRecoveryModalData(bill)}
                                    className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xs text-[10px] font-mono flex items-center gap-1 border border-emerald-200 cursor-pointer"
                                    title="Send WhatsApp Bill"
                                  >
                                    <MessageCircle size={12} />
                                    <span>WhatsApp</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quick Billing Products Management (Asking Name & Price) */}
        {activeTab === "billing_products" && (
          <div className="flex-1 p-4 overflow-y-auto bg-zinc-50/50 font-mono">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header Info */}
              <div className="bg-white p-4 rounded-xs border border-zinc-150 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-950 font-sans tracking-tight flex items-center gap-2">
                    <Package size={16} className="text-purple-600" />
                    <span>Quick Billing Products Management</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Add products directly to the billing section asking only Name and Price.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-xs border border-purple-200">
                    {billingProductsData.length} Quick Products
                  </span>
                </div>
              </div>

              {/* Form & List Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Add / Edit Product Form */}
                <div className="bg-white p-5 rounded-xs border border-zinc-150 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
                    <h3 className="font-sans font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Plus size={14} className="text-purple-600" />
                      <span>{editingBillingProduct ? "Edit Billing Product" : "Add Billing Product"}</span>
                    </h3>
                    {editingBillingProduct && (
                      <button
                        type="button"
                        onClick={handleCancelEditBillingProduct}
                        className="text-[10px] text-zinc-400 hover:text-zinc-600 hover:underline cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveBillingProduct} className="space-y-4 text-xs">
                    {/* Product Name Input */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-1.5">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gift Box Packaging, Alteration, Belt..."
                        value={newBillingProductForm.name}
                        onChange={(e) => setNewBillingProductForm({ ...newBillingProductForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xs text-zinc-900 font-medium focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                      />
                    </div>

                    {/* Price Input */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-1.5">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="0.00"
                          value={newBillingProductForm.price}
                          onChange={(e) => setNewBillingProductForm({ ...newBillingProductForm, price: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingBillingProduct}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xs font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        {isSubmittingBillingProduct ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Saving Product...</span>
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            <span>{editingBillingProduct ? "Update Product" : "Save to Billing Section"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Card: Products Table / List */}
                <div className="lg:col-span-2 bg-white rounded-xs border border-zinc-150 shadow-2xs overflow-hidden flex flex-col">
                  {/* List Header Search */}
                  <div className="p-3 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search quick products by name or Item ID..."
                        value={billingProductSearchQuery}
                        onChange={(e) => setBillingProductSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xs text-xs font-mono text-zinc-900 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Showing <span className="font-bold text-zinc-900">{filteredBillingProductsList.length}</span> items
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-zinc-100/70 border-b border-zinc-150 text-[10px] uppercase text-zinc-500">
                        <tr>
                          <th className="p-3">Item ID</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Price</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredBillingProductsList.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-12 text-center text-zinc-400">
                              No billing products found. Use the form to add a product asking only Name & Price!
                            </td>
                          </tr>
                        ) : (
                          filteredBillingProductsList.map((bp) => (
                            <tr key={bp._id} className="hover:bg-zinc-50/70 transition-colors">
                              <td className="p-3 text-zinc-500 font-bold">{bp.itemId}</td>
                              <td className="p-3">
                                <span className="font-sans font-bold text-zinc-950">{bp.name}</span>
                                <span className="ml-2 px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[9px] rounded-xs border border-purple-200">
                                  Quick Item
                                </span>
                              </td>
                              <td className="p-3 font-bold text-zinc-950">₹{bp.price.toFixed(2)}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleStartEditBillingProduct(bp)}
                                    className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBillingProduct(bp._id, bp.name)}
                                    className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Admin User & Cashier Management Modal */}
      <AnimatePresence>
        {showUserModal && userRole === "admin" && (
          <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xs border border-zinc-200 shadow-xl max-w-lg w-full p-5 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-zinc-800" />
                  <h3 className="font-sans font-bold text-sm text-zinc-950">POS Cashier User Management</h3>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Create New User Form (Name, Role, PIN only) */}
              <form onSubmit={handleCreateNewUser} className="bg-zinc-50 border border-zinc-200 rounded-xs p-3 mb-4 space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-800 uppercase">
                  <UserPlus size={13} className="text-emerald-600" />
                  <span>Create New Staff Account</span>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-semibold uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Singh"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-2.5 py-1 bg-white border border-zinc-200 rounded-xs text-zinc-900 focus:outline-none focus:border-zinc-400 font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-semibold uppercase block mb-1">Access Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-xs text-zinc-900 focus:outline-none focus:border-zinc-400 font-bold"
                    >
                      <option value="user">User (Cashier - Billing Only)</option>
                      <option value="admin">Admin (Supervisor - Full Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-semibold uppercase block mb-1">4-Digit Security PIN</label>
                    <input
                      type="password"
                      required
                      maxLength={10}
                      placeholder="e.g. 5555"
                      value={newUserForm.pin}
                      onChange={(e) => setNewUserForm({ ...newUserForm, pin: e.target.value })}
                      className="w-full px-2.5 py-1 bg-white border border-zinc-200 rounded-xs text-zinc-900 focus:outline-none focus:border-zinc-400 font-bold font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Save & Register User Account
                </button>
              </form>

              {/* Registered Cashiers List */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">
                  Active POS Cashier Accounts ({registeredUsers.length}):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {registeredUsers.map((usr) => (
                    <div
                      key={usr.id}
                      className="p-2 bg-white border border-zinc-200 rounded-xs flex items-center justify-between hover:border-zinc-300"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xs bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-xs">
                          {usr.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 text-xs">{usr.name}</div>
                          <div className="text-[10px] text-zinc-400">
                            ID: <span className="font-mono text-zinc-600">{usr.username}</span> • Role:{" "}
                            <span className={usr.role === "admin" ? "text-emerald-600 font-bold" : "text-blue-600 font-bold"}>
                              {usr.role.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeCashier?.id === usr.id && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-xs border border-emerald-200">
                            ACTIVE NOW
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Cashier"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-150 mt-4 flex justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded-xs text-xs font-mono font-bold cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Recovery Modal */}
      {recoveryModalData && (
        <WhatsAppRecoveryModal
          bill={recoveryModalData}
          onClose={() => setRecoveryModalData(null)}
        />
      )}
    </div>
  );
}
