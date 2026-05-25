"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TopPicksSlider() {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'products', operation: 'getAll', args: {} }),
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const result = await res.json();
        setProducts(result || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", padding: "20px 0" }}>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}>
          <p>Failed to load products. Please try again later.</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
          <p>No products available.</p>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              gap: "16px",
              padding: "0 16px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {products.map((product) => (
              <div
                key={product._id || product.itemId}
                style={{
                  flex: "0 0 auto",
                  width: "280px",
                  scrollSnapAlign: "start",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
