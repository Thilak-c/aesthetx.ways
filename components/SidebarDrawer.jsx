import { useState, useMemo } from "react";
import Link from "next/link";
import { X, ChevronRight, User } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SidebarDrawer({ open, onClose, width = "w-4/5 max-w-sm" }) {
  const [expandedSection, setExpandedSection] = useState(null);

  // Fetch all products to extract categories and subcategories
  const products = useQuery(api.category.getAllProducts) ?? [];
  
  // Fetch dynamic collections from database
  const collections = useQuery(api.collections.getAllCollections) ?? [];

  // Extract unique categories and their subcategories
  const categoriesData = useMemo(() => {
    const categoryMap = {};
    
    products.forEach((product) => {
      const category = product.category;
      const subcategory = product.subcategories;
      
      if (category) {
        if (!categoryMap[category]) {
          categoryMap[category] = new Set();
        }
        if (subcategory) {
          categoryMap[category].add(subcategory);
        }
      }
    });

    // Convert to array format
    return Object.keys(categoryMap).map((category) => ({
      name: category,
      subcategories: Array.from(categoryMap[category]).sort(),
    }));
  }, [products]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full ${width} text-[13px/] bg-white z-[9999] transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with Logo and Close */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" onClick={onClose}>
            <img src="/logo.png" alt="Logo" className="h-8" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

      

        {/* Navigation Menu */}
        <nav className="py-4">
          {/* Home */}
          <Link href="/" onClick={onClose}>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-base font-normal text-gray-900">Home</span>
            </div>
          </Link>

          {/* Shop by Category - Dynamic from Database */}
          {categoriesData.map((category) => (
            <div key={category.name}>
              <button
                onClick={() => toggleSection(category.name)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-base font-normal text-gray-900">{category.name}</span>
                <ChevronRight
                  size={20}
                  className={`text-gray-500 transition-transform ${
                    expandedSection === category.name ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSection === category.name && (
                <div className="bg-gray-50 py-2">
                  {/* All items link */}
                  <Link href={`/shop?ct=${category.name.toLowerCase()}`} onClick={onClose}>
                    <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                      <span className="text-xs font-light text-gray-600">All {category.name}</span>
                    </div>
                  </Link>
                  
                  {/* Subcategories */}
                  {category.subcategories.map((subcategory) => (
                    <Link 
                      key={subcategory}
                      href={`/shop/subcategory?ct=${category.name.toLowerCase()}&sub=${encodeURIComponent(subcategory)}`} 
                      onClick={onClose}
                    >
                      <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <span className="text-xs font-light text-gray-600">{subcategory}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="my-2 mx-6 border-t border-gray-200"></div>

          {/* Collections Section - Dynamic from Database */}
          {collections.length > 0 && (
            <>
              <div>
                <button
                  onClick={() => toggleSection('collections')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-base font-normal text-gray-900">Collections</span>
                  <ChevronRight
                    size={20}
                    className={`text-gray-500 transition-transform ${
                      expandedSection === 'collections' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedSection === 'collections' && (
                  <div className="bg-gray-50 py-2">
                    {collections.map((collection) => (
                      <Link 
                        key={collection.slug}
                        href={`/collections/${collection.slug}`} 
                        onClick={onClose}
                      >
                        <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                          <span className="text-xs font-light text-gray-600">{collection.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-2 mx-6 border-t border-gray-200"></div>
            </>
          )}

          {/* Contact us */}
          <Link href="/contact" onClick={onClose}>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-base font-normal text-gray-900">Contact us</span>
            </div>
          </Link>

          {/* Return Policy */}
          <Link href="/return-policy" onClick={onClose}>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-base font-normal text-gray-900">Return Policy</span>
            </div>
          </Link>
        </nav>

        {/* Login Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
          <Link href="/login" onClick={onClose}>
            <button className="w-full flex items-center justify-center gap-2 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors rounded-lg">
              <User size={20} />
              <span>Log in</span>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
