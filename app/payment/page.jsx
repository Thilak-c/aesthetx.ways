"use client";
import { useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
  
    const txnid = "txn_" + new Date().getTime(); // unique txnid
    const amount = "100.00";
    const productinfo = "Test Product";
    const firstname = "Thilak";
    const email = "test@example.com";
  
    // 1. Get hash + key from server
    const res = await fetch("/api/payu/hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txnid, amount, productinfo, firstname, email }),
    });
  
    const data = await res.json();
    console.log("PayU Hash Response:", data);
  
    if (data.error) {
      alert("Server error: " + data.error);
      setLoading(false);
      return;
    }
  
    const { hash, key } = data; // ✅ now key is defined
  
    // 2. Build PayU form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://test.payu.in/_payment"; // sandbox URL
  
    const fields = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone: "9876543210",
      surl: "http://localhost:3000/payment/success",
      furl: "http://localhost:3000/payment/failure",
      hash,
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
    };
  
    for (const k in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = fields[k];
      form.appendChild(input);
    }
  
    document.body.appendChild(form);
    form.submit();
  }
  

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">PayU Payment</h1>
      <button
        onClick={handlePay}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        {loading ? "Redirecting..." : "Pay ₹100"}
      </button>
    </div>
  );
}
