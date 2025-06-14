'use client'

import React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Text, useGLTF, Stars, Html, Sparkles } from '@react-three/drei'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, useRef, Suspense, ErrorBoundary, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import dynamic from 'next/dynamic'
import { FiSun, FiMoon, FiShoppingCart, FiEye, FiAward, FiActivity, FiCoffee, FiBriefcase, FiClock, FiCpu, FiImage, FiTwitter, FiInstagram, FiMessageCircle, FiExternalLink, FiMenu, FiX } from 'react-icons/fi'
import TextCursor from '@/components/TextCursor/TextCursor'
import BlurText from "@/components/BlurText/BlurText"
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal'
import ScrollVelocity from '@/components/ScrollVelocity/ScrollVelocity'
import StarBorder from '@/components/StarBorder/StarBorder'

// Dynamically import heavy components
const CircularGallery = dynamic(() => import('@/component/CircularGallery/CircularGallery'), {
  loading: () => <div className="h-[600px] flex items-center justify-center">Loading gallery...</div>,
  ssr: false
})

const FlowingMenu = dynamic(() => import('@/component/FlowingMenu/FlowingMenu'), {
  loading: () => <div className="h-[600px] flex items-center justify-center">Loading menu...</div>,
  ssr: false
})

import './globals.css'

// Error boundary component
class ErrorBoundaryComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};
//test
const demoItems = [
  { link: '#', text: 'Men', image: '/random/1.png' },
  { link: '#', text: 'Women', image: 'https://www.shutterstock.com/image-photo/portrait-elegant-woman-hydrated-skin-600nw-2500102381.jpg' },
  { link: '#', text: 'Unisex ', image: 'https://cdn.shopify.com/s/files/1/0453/4049/1929/files/Page-Header-Image_68e1b922-1cae-4a1b-8df4-bf1f9d48625a.jpg?v=1676036767' },
];

// Add these new categories with more detailed items
const categoryItems = [
  { name: "Streetwear", icon: <FiEye className="w-4 h-4" />, color: "#FF6B6B", description: "Urban Style" },
  { name: "Luxury", icon: <FiAward className="w-4 h-4" />, color: "#4ECDC4", description: "Premium Collection" },
  { name: "Sport", icon: <FiActivity className="w-4 h-4" />, color: "#45B7D1", description: "Active Wear" },
  { name: "Casual", icon: <FiCoffee className="w-4 h-4" />, color: "#96CEB4", description: "Everyday Style" },
  { name: "Formal", icon: <FiBriefcase className="w-4 h-4" />, color: "#FFEEAD", description: "Business Attire" },
  { name: "Vintage", icon: <FiClock className="w-4 h-4" />, color: "#D4A5A5", description: "Retro Collection" },
  { name: "Tech", icon: <FiCpu className="w-4 h-4" />, color: "#9B59B6", description: "Smart Fashion" },
  { name: "Art", icon: <FiImage className="w-4 h-4" />, color: "#E67E22", description: "Creative Wear" }
]

// Preload 3D models
const preloadModels = () => {
  const models = [
    '/models/hero/1.glb',
    '/models/hero/2.glb',
    '/models/hero/3.glb',
    '/models/hero/4.glb',
    '/models/show-case/1.glb',
    '/models/show-case/2.glb',
    '/models/show-case/3.glb'
  ]
  
  models.forEach(model => {
    useGLTF.preload(model)
  })
}

// Font configuration
const fontConfig = {
  heading: 'var(--font-clash-display)',
  body: 'var(--font-general-sans)',
  accent: 'var(--font-cabinet-grotesk)'
}

function SpinningText() {
  const modelRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const models = [
    useGLTF('/models/hero/1.glb'),
    useGLTF('/models/hero/2.glb'),
    useGLTF('/models/hero/3.glb'),
    useGLTF('/models/hero/4.glb')
  ]
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 2, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((state) => {
    modelRefs.forEach((ref, index) => {
      if (ref.current) {
          ref.current.rotation.y += 0.01
          ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5 + index * Math.PI / 2) * 0.2
          ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3 + index * Math.PI / 2) * 0.1
          ref.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.3 + index * Math.PI / 2) * 0.1
        
        ref.current.position.y += Math.sin(state.clock.getElapsedTime() + index) * 0.001
        ref.current.position.x += Math.cos(state.clock.getElapsedTime() + index) * 0.001
      }
    })
  })

  const radius = 3.5
  const positions = [
    [radius, 0, 0],
    [0, 0, radius],
    [-radius, 0, 0],
    [0, 0, -radius],
  ]

  return (
    <group position={[0, 0, 0]}>
      <OrbitControls
        enableZoom={false}
        enablePan={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 3/4}
        autoRotate={true}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />

      {positions.map((position, index) => (
        <group key={index} position={position}>
          <primitive
            ref={modelRefs[index]}
            object={models[index].scene.clone()}
            scale={0.8}
            rotation={[0, index * Math.PI / 2, 0]}
          />
        </group>
      ))}

      <Sparkles
        count={50}
        scale={[8, 8, 8]}
        size={0.1}
        speed={0.2}
        color="#c026d3"
      />

      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight 
        position={[8, 8, 8]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
      />
      <directionalLight 
        position={[-8, 8, -8]} 
        intensity={0.7} 
        color="#f0f0ff"
      />
      <pointLight 
        position={[0, 5, 3]} 
        intensity={0.5} 
        color="#ff69b4"
        distance={15}
      />
      <pointLight 
        position={[0, -5, -3]} 
        intensity={0.4} 
        color="#4169e1"
        distance={15}
      />
      <spotLight
        position={[0, 0, 8]}
        angle={0.4}
        penumbra={1}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />
    </group>
  )
}

function AnimatedStars() {
  const starsRef = useRef(null)
  const clockRef = useRef(0)

  useFrame((state) => {
    if (!starsRef.current) return

    clockRef.current += 0.0005
    const time = state.clock.getElapsedTime()

    starsRef.current.rotation.x = Math.sin(time * 0.1) * 0.2
    starsRef.current.rotation.y = Math.cos(time * 0.15) * 0.3
    starsRef.current.rotation.z += 0.001

    // Add pulsing effect
    const pulse = Math.sin(time * 0.5) * 0.02 + 1
    starsRef.current.scale.setScalar(pulse)
  })

  return (
    <Stars
      ref={starsRef}
      radius={150}
      depth={60}
      count={8000}
      factor={6}
      saturation={0}
      fade
      speed={0.3}
    />
  )
}

function ProfessionalIntro({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, delay: 2.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          rotate: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
          }
        }}
        className="text-6xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
        style={{ fontFamily: fontConfig.heading }}
      >
        AESTHETX
      </motion.div>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: '40%', 
          opacity: 1,
          transition: { 
            duration: 1.5, 
            delay: 0.5,
            ease: "easeInOut"
          }
        }}
        className="h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent my-6"
      />
      <motion.p
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            duration: 1, 
            delay: 1.2,
            type: "spring",
            stiffness: 100
          }
        }}
        className="text-gray-400 text-lg"
        style={{ fontFamily: fontConfig.body }}
      >
        Digital Fashion Marketplace
      </motion.p>
    </motion.div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
    </div>
  )
}

function ProductCard({ id, title, price, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        y: -10, 
        scale: 1.03,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
      className={`relative overflow-hidden rounded-xl shadow-lg ${theme === 'dark' ? 'bg-neutral-900' : 'bg-white'} cursor-pointer group`}
      role="article"
      aria-label={`Product: ${title}`}
    >
      <motion.div 
        className={`aspect-square ${theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'} flex items-center justify-center relative overflow-hidden`}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
      >
        <motion.div
          animate={{
            rotateY: [0, 15, 0],
            scale: [1, 1.05, 1],
            transition: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="text-center p-6"
        >
          <motion.span 
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}
            style={{ fontFamily: fontConfig.accent }}
            whileHover={{
              scale: 1.1,
              color: theme === 'dark' ? '#ec4899' : '#d946ef',
              transition: { duration: 0.2 }
            }}
          >
            3D Shirt #{id}
          </motion.span>
        </motion.div>

        <motion.button
          whileHover={{ 
            scale: 1.05,
            backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.9)' : 'rgba(236, 72, 153, 0.9)'
          }}
          whileTap={{ scale: 0.95 }}
          className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark'
            ? 'bg-fuchsia-600/90 hover:bg-fuchsia-700'
            : 'bg-fuchsia-500/90 hover:bg-fuchsia-600'
            } text-white backdrop-blur-sm flex items-center gap-1`}
          aria-label="Try AR view"
          style={{ fontFamily: fontConfig.body }}
        >
          <motion.span 
            role="img" 
            aria-label="AR view icon"
            animate={{
              rotate: [0, 10, -10, 0],
              transition: { duration: 1, repeat: Infinity }
            }}
          >
            <FiEye className="w-4 h-4" />
          </motion.span> 
          Try AR
        </motion.button>
      </motion.div>
      <motion.div 
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h3 
          className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: fontConfig.heading }}
          whileHover={{ x: 5 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className={`mt-2 ${theme === 'dark' ? 'text-fuchsia-400' : 'text-fuchsia-600'} font-bold`}
          style={{ fontFamily: fontConfig.accent }}
          whileHover={{ scale: 1.05 }}
        >
          {price}
        </motion.p>
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          className={`mt-4 w-full py-2 rounded-lg font-medium ${theme === 'dark'
            ? 'bg-fuchsia-600 hover:bg-fuchsia-700'
            : 'bg-fuchsia-500 hover:bg-fuchsia-600'
            } text-white transition-colors`}
          aria-label={`View ${title} drop`}
          style={{ fontFamily: fontConfig.body }}
        >
          View Drop
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function GradientBackground({ darkTheme }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 -z-10 ${darkTheme
        ? 'bg-gradient-to-br from-black via-purple-900/20 to-black'
        : 'bg-gradient-to-br from-gray-100 via-fuchsia-100/50 to-gray-100'
        }`}
    >
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }}
        className={`absolute inset-0 ${darkTheme
          ? 'bg-gradient-to-br from-transparent via-purple-900/10 to-transparent'
          : 'bg-gradient-to-br from-transparent via-fuchsia-200/30 to-transparent'
          } bg-[length:200%_200%]`}
      />
    </motion.div>
  )
}

// Memoize components for better performance
const MemoizedProductCard = React.memo(ProductCard)
const MemoizedModel3D = React.memo(Model3D)
const MemoizedSpinningText = React.memo(SpinningText)

// Performance optimization for animations
const animationConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30
}

// Animation configurations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

function ProductShowcase({ darkTheme }) {
  const [activeProduct, setActiveProduct] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const products = useMemo(() => [
    { id: 1, name: "Neon Dream Tee", model: "/models/show-case/1.glb" },
    { id: 2, name: "Cyberpunk Hoodie", model: "/models/show-case/2.glb" },
    { id: 3, name: "Glitch Jacket", model: "/models/show-case/3.glb" }
  ], [])

  const handleProductChange = useCallback((index) => {
    setActiveProduct(index)
    setIsLoading(true)
  }, [])

  return (
    <section id="showcase" className="py-20 px-4 relative min-h-screen" aria-label="Product showcase">
      <GradientBackground darkTheme={darkTheme} />

      <motion.div 
        className="container mx-auto h-full flex flex-col md:flex-row items-center gap-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <motion.div 
          className="md:w-1/2 h-[500px] md:h-[600px] flex"
          variants={scaleIn}
        >
          <Canvas className="w-full h-full">
            <Suspense fallback={<Html center><LoadingSpinner /></Html>}>
              <ambientLight intensity={0.3} color="#ffffff" />
              <directionalLight position={[8, 8, 8]} intensity={1.2} color="#ffffff" castShadow />
              <directionalLight position={[-8, 8, -8]} intensity={0.7} color="#f0f0ff" />
              <pointLight position={[0, 5, 3]} intensity={0.5} color="#ff69b4" distance={15} />
              <pointLight position={[0, -5, -3]} intensity={0.4} color="#4169e1" distance={15} />
              <spotLight position={[0, 0, 8]} angle={0.4} penumbra={1} intensity={0.5} color="#ffffff" castShadow />
              <MemoizedModel3D 
                url={products[activeProduct].model} 
                onLoad={() => setIsLoading(false)}
              />
              <OrbitControls 
                enableZoom={false} 
                autoRotate 
                autoRotateSpeed={4}
                minDistance={3}
                maxDistance={8}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI * 3/4}
                dampingFactor={0.05}
                rotateSpeed={0.5}
              />
            </Suspense>
          </Canvas>
        </motion.div>

        <motion.div 
          className={`md:w-1/2 md:pl-12 ${darkTheme ? 'text-white' : 'text-gray-900'}`}
          variants={slideIn}
        >
          <motion.h2 
            className="text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            OUR COLLECTION
          </motion.h2>

          <motion.div 
            className="space-y-4" 
            role="list" 
            aria-label="Product collection"
            variants={staggerContainer}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ 
                  x: 10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onClick={() => handleProductChange(index)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${activeProduct === index
                  ? 'bg-fuchsia-600/20 border-l-4 border-fuchsia-400'
                  : darkTheme
                    ? 'bg-neutral-800/50 hover:bg-neutral-800/70'
                    : 'bg-gray-200/50 hover:bg-gray-200/70'
                  }`}
                role="listitem"
                aria-selected={activeProduct === index}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleProductChange(index)
                  }
                }}
              >
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className={darkTheme ? "text-gray-400" : "text-gray-600"}>Limited Edition</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            variants={fadeInUp}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            className={`mt-8 px-6 py-3 rounded-full font-medium ${darkTheme
              ? 'bg-fuchsia-600 hover:bg-fuchsia-700'
              : 'bg-fuchsia-500 hover:bg-fuchsia-600'
              } text-white`}
            aria-label="View full collection"
          >
            View Full Collection
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Model3D({ url, onLoad }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef()

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          child.material.envMapIntensity = 1
        }
      })
    }
  }, [])

  useEffect(() => {
    if (onLoad) {
      onLoad()
    }
  }, [onLoad])

  return <primitive ref={modelRef} object={scene} scale={2} position={[0, -2, 0]} />
}

function Navigation({ darkTheme }) {
  const sections = ['hero', 'drops', 'showcase', 'cta']
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:block"
    >
      <div className="flex flex-col items-center gap-4">
        {sections.map((section) => (
          <motion.a
            key={section}
            href={`#${section}`}
            whileHover={{ 
              scale: 1.2,
              backgroundColor: darkTheme ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)'
            }}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeSection === section
              ? (darkTheme ? 'bg-fuchsia-400' : 'bg-fuchsia-600')
              : (darkTheme ? 'bg-gray-600' : 'bg-gray-400')
              }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

function CartIndicator({ darkTheme }) {
  const [itemCount, setItemCount] = useState(0)

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        rotate: [0, -5, 5, -5, 0],
        transition: { duration: 0.5 }
      }}
      className="relative"
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-full ${darkTheme ? 'bg-neutral-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setItemCount(prev => prev + 1)}
      >
        <FiShoppingCart className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${darkTheme ? 'bg-fuchsia-500 text-white' : 'bg-fuchsia-600 text-white'}`}
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FloatingCategoryButton = ({ category, index }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({
    x: (Math.random() * 2 - 1) * 0.2,
    y: (Math.random() * 2 - 1) * 0.2
  });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
  const animationRef = useRef(null);
  const gravity = 0.0001;
  const friction = 0.995;
  const bounceEnergy = 0.9;
  const floatAmplitude = 0.3;
  const floatFrequency = 0.001;
  const maxSpeed = 0.5;

  useEffect(() => {
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      setPosition(prev => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;

        const floatX = Math.sin(elapsedTime * floatFrequency + index) * floatAmplitude;
        const floatY = Math.cos(elapsedTime * floatFrequency + index) * floatAmplitude;

        setVelocity(prev => {
          let newVelX = prev.x * friction + floatX * 0.01;
          let newVelY = prev.y * friction + gravity + floatY * 0.01;

          const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
          if (speed > maxSpeed) {
            const ratio = maxSpeed / speed;
            newVelX *= ratio;
            newVelY *= ratio;
          }

          return { x: newVelX, y: newVelY };
        });

        const buttonWidth = buttonRef.current?.offsetWidth || 0;
        const buttonHeight = buttonRef.current?.offsetHeight || 0;

        const maxX = 90 - (buttonWidth / 2);
        const maxY = 90 - (buttonHeight / 2);
        const minX = -90 + (buttonWidth / 2);
        const minY = -90 + (buttonHeight / 2);

        let newVelX = velocity.x;
        let newVelY = velocity.y;

        if ((newX >= maxX || newX <= minX) && (newY >= maxY || newY <= minY)) {
          newVelX = -velocity.x * bounceEnergy;
          newVelY = -velocity.y * bounceEnergy;
          newX = Math.sign(newX) * maxX;
          newY = Math.sign(newY) * maxY;
        } else {
          if (newX >= maxX) {
            newVelX = -Math.abs(velocity.x) * bounceEnergy;
            newX = maxX;
          } else if (newX <= minX) {
            newVelX = Math.abs(velocity.x) * bounceEnergy;
            newX = minX;
          }

          if (newY >= maxY) {
            newVelY = -Math.abs(velocity.y) * bounceEnergy;
            newY = maxY;
          } else if (newY <= minY) {
            newVelY = Math.abs(velocity.y) * bounceEnergy;
            newY = minY;
          }
        }

        setVelocity({ x: newVelX, y: newVelY });

        if (Math.random() < 0.01) {
          setVelocity(prev => ({
            x: prev.x + (Math.random() * 0.1 - 0.05),
            y: prev.y + (Math.random() * 0.1 - 0.05)
          }));
        }

        return { x: newX, y: newY };
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [velocity, index]);

  return (
    <motion.button
      ref={buttonRef}
      className="absolute px-6 py-3 rounded-full text-sm font-medium transition-all duration-300"
      style={{
        left: `${50 + position.x}%`,
        top: `${50 + position.y}%`,
        transform: `translate(-50%, -50%)`,
        background: isHovered 
          ? `linear-gradient(45deg, rgba(236, 72, 153, 0.9), rgba(147, 51, 234, 0.9))`
          : `linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(147, 51, 234, 0.2))`,
        backdropFilter: 'blur(8px)',
        boxShadow: isHovered
          ? `0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(147, 51, 234, 0.3)`
          : `0 0 10px rgba(236, 72, 153, 0.3), 0 0 20px rgba(147, 51, 234, 0.2)`,
        border: `1px solid rgba(236, 72, 153, ${isHovered ? 0.5 : 0.2})`,
        color: isHovered ? 'white' : 'rgba(255, 255, 255, 0.8)',
        textShadow: isHovered ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
      }}
      whileHover={{ 
        scale: 1.15,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.span
        animate={{
          scale: isHovered ? [1, 1.1, 1] : 1,
          transition: { duration: 0.5, repeat: isHovered ? Infinity : 0 }
        }}
      >
        {category}
      </motion.span>
    </motion.button>
  );
};

const FloatingCategories = ({ darkTheme }) => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto relative z-10"
      >
        <div
          ref={containerRef}
          className="relative h-[600px] w-full cursor-pointer overflow-hidden"
        >
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
              background: darkTheme 
                ? 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)'
                : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 70%)',
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {categoryItems.map((item, index) => (
            <FloatingCategoryButton
              key={item.name}
              category={item.name}
              index={index}
            />
          ))}

          <AnimatePresence>
            {selectedCategory !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg backdrop-blur-md
                  ${darkTheme ? 'bg-neutral-800/80' : 'bg-white/80'} shadow-lg`}
                style={{
                  border: `2px solid ${categoryItems[selectedCategory].color}40`,
                  boxShadow: `0 0 30px ${categoryItems[selectedCategory].color}20`
                }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: fontConfig.heading }}>
                  {categoryItems[selectedCategory].name}
                </h3>
                <p className="text-sm opacity-80" style={{ fontFamily: fontConfig.body }}>
                  {categoryItems[selectedCategory].description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Background Text Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.03 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={`text-[7vw] font-bold whitespace-nowrap ${darkTheme ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: fontConfig.heading }}
        >
          EXPLORE CATEGORIES
        </motion.h1>
      </motion.div>
    </section>
  );
};

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [darkTheme, setDarkTheme] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ container: containerRef })
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  const products = useMemo(() => [
    { id: 1, title: "Neon Dream Tee", price: "49.99 ETH" },
    { id: 2, title: "Cyberpunk Hoodie", price: "79.99 ETH" },
    { id: 3, title: "Glitch Effect Jacket", price: "129.99 ETH" },
    { id: 4, title: "Holographic Pants", price: "89.99 ETH" },
    { id: 5, title: "Digital Camo Shorts", price: "59.99 ETH" },
    { id: 6, title: "Matrix Gloves", price: "39.99 ETH" },
  ], [])

  useEffect(() => {
    preloadModels()
  }, [])

  return (
    <ErrorBoundaryComponent>
      <main
        ref={containerRef}
        className={`min-h-screen w-full ${darkTheme ? 'bg-black' : 'bg-gray-100'} ${darkTheme ? 'text-white' : 'text-gray-900'
          } overflow-x-hidden scroll-smooth`}
        style={{ fontFamily: fontConfig.body }}
      >
        <AnimatePresence>
          {showIntro && <ProfessionalIntro onComplete={() => setShowIntro(false)} />}
        </AnimatePresence>

        {!showIntro && (
          <>
            <GradientBackground darkTheme={darkTheme} />
            <Navigation darkTheme={darkTheme} />

            <motion.header
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={animationConfig}
              className={`fixed top-0 left-0 right-0 z-50 ${darkTheme 
                ? 'bg-black/60 backdrop-blur-xl border-neutral-800/50' 
                : 'bg-white/60 backdrop-blur-xl border-gray-200/50'} border-b`}
            >
              <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`text-2xl font-bold ${darkTheme ? 'text-fuchsia-400' : 'text-fuchsia-600'} relative group`}
                    style={{ fontFamily: fontConfig.heading }}
                  >
                    AesthetX
                  </motion.div>

                  <div className="flex items-center gap-8">
                    <nav className="hidden md:flex gap-8">
                      {['Drops', 'Collections'].map((item) => (
                        <motion.a
                          key={item}
                          whileHover={{ y: -2 }}
                          className="relative group"
                        >
                          <span className={`text-sm font-medium transition-colors ${darkTheme ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} style={{ fontFamily: fontConfig.body }}>
                            {item}
                          </span>
                          <motion.div
                            className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-500"
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.a>
                      ))}
                    </nav>

                    <div className="flex items-center gap-4">
                      <CartIndicator darkTheme={darkTheme} />

                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDarkTheme(!darkTheme)}
                        className={`p-2 rounded-full relative group ${darkTheme 
                          ? 'bg-neutral-800/80 text-gray-300 hover:bg-neutral-700/80' 
                          : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80'} transition-all duration-300 backdrop-blur-sm`}
                      >
                        {darkTheme ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                      </motion.button>

                      {/* Mobile Menu Button */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`p-2 rounded-full md:hidden ${darkTheme 
                          ? 'bg-neutral-800/80 text-gray-300 hover:bg-neutral-700/80' 
                          : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80'} transition-all duration-300 backdrop-blur-sm`}
                      >
                        {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Panel */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`md:hidden ${darkTheme ? 'bg-black/30' : 'bg-white/30'} backdrop-blur-2xl border-t ${darkTheme ? 'border-neutral-800/30' : 'border-gray-200/30'}`}
                  >
                    <div className="container mx-auto px-6 py-4">
                      <nav className="flex flex-col gap-4">
                        {['Drops', 'Collections', 'Marketplace', 'AR Try-On'].map((item, index) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <motion.a
                              href="#"
                              whileHover={{ x: 10 }}
                              whileTap={{ scale: 0.98 }}
                              className={`group flex items-center gap-3 text-lg font-medium py-3 px-4 rounded-xl ${darkTheme 
                                ? 'text-gray-200 hover:text-white hover:bg-white/5' 
                                : 'text-gray-700 hover:text-black hover:bg-black/5'} transition-all duration-300`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <motion.div
                                className={`w-1.5 h-1.5 rounded-full ${darkTheme ? 'bg-fuchsia-400' : 'bg-fuchsia-500'}`}
                                whileHover={{ scale: 1.5 }}
                                transition={{ duration: 0.2 }}
                              />
                              <span>{item}</span>
                              <motion.div
                                className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={false}
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                →
                              </motion.div>
                            </motion.a>
                          </motion.div>
                        ))}

                        {/* Divider */}
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: 0.4 }}
                          className={`h-px my-2 ${darkTheme ? 'bg-white/10' : 'bg-black/10'}`}
                        />

                        {/* Additional Links */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex flex-wrap gap-4 justify-center py-4"
                        >
                          {[
                            { icon: <FiTwitter className="w-5 h-5" />, label: "Twitter" },
                            { icon: <FiInstagram className="w-5 h-5" />, label: "Instagram" },
                            { icon: <FiMessageCircle className="w-5 h-5" />, label: "Discord" }
                          ].map((social, index) => (
                            <motion.a
                              key={social.label}
                              href="#"
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-3 rounded-full ${darkTheme 
                                ? 'bg-white/5 text-gray-200 hover:bg-white/10' 
                                : 'bg-black/5 text-gray-700 hover:bg-black/10'} transition-colors duration-300`}
                            >
                              {social.icon}
                            </motion.a>
                          ))}
                        </motion.div>
                      </nav>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.header>

            <section id="hero" className="h-screen w-full relative">
              <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
                <Canvas>
                  <Suspense fallback={<Html center><LoadingSpinner /></Html>}>
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />
                    <AnimatedStars />
                    <MemoizedSpinningText />
                  </Suspense>
                </Canvas>
              </div>
              {/* Scroll Down Arrow */}
              <motion.div 
                className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
              >
                <svg 
                  className="w-8 h-8 text-white"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                  />
                </svg>
              </motion.div>
            </section>

            <section id="drops" className="py-20 px-4 md:px-12 relative">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={animationConfig}
                className="container mx-auto"
              >
                <div className="text-center mb-16">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className={`text-4xl md:text-6xl font-bold mb-6 ${darkTheme ? 'text-white' : 'text-gray-900'
                      }`}
                  >
                    <BlurText
                      text="LATEST DROPS"
                      delay={150}
                      animateBy="words"
                      direction="top"
                      onAnimationComplete={handleAnimationComplete}
                      className="flex justify-center"
                    />
                  </motion.h2>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '200px' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-1 mx-auto ${darkTheme ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600' : 'bg-gradient-to-r from-fuchsia-400 to-purple-500'
                      }`}
                  />
                </div>

                <TextCursor
                  text="Hello!"
                  delay={0.01}
                  spacing={80}
                  followMouseDirection={true}
                  randomFloat={true}
                  exitDuration={0.3}
                  removalInterval={20}
                  maxPoints={10}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <MemoizedProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      theme={darkTheme ? 'dark' : 'light'}
                    />
                  ))}
                </div>
              </motion.div>
            </section>
            <section className="relative py-20 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="container mx-auto relative z-10"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`h-[2px] relative ${darkTheme ? 'bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent' : 'bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent'}`}
                  >
                    <motion.div
                      animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    />
                  </motion.div>

                  {/* Added 3D Floating Elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                          background: darkTheme 
                            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0) 70%)'
                            : 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0) 70%)',
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </div>

                  {/* Added Glowing Orbs */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-32 h-32 rounded-full blur-3xl"
                        style={{
                          background: darkTheme 
                            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)'
                            : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 70%)',
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          x: [0, 30, 0],
                          y: [0, -30, 0],
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                          duration: 5 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.7,
                        }}
                      />
                    ))}
                  </div>

                  {/* Added Particle Effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-fuchsia-500"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -100],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>
            <ProductShowcase darkTheme={darkTheme} />
            <section className="relative py-20 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="container mx-auto relative z-10"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`h-[2px] relative ${darkTheme ? 'bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent' : 'bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent'}`}
                  >
                    <motion.div
                      animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    />
                  </motion.div>

                  {/* Added 3D Floating Elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                          background: darkTheme 
                            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0) 70%)'
                            : 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0) 70%)',
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </div>

                  {/* Added Glowing Orbs */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-32 h-32 rounded-full blur-3xl"
                        style={{
                          background: darkTheme 
                            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)'
                            : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 70%)',
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          x: [0, 30, 0],
                          y: [0, -30, 0],
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                          duration: 5 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.7,
                        }}
                      />
                    ))}
                  </div>

                  {/* Added Particle Effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-fuchsia-500"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -100],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            <section id="scroll" className="py-20 px-4 md:px-12 relative">
              <ScrollVelocity
                texts={['Our Collection -','Our Collection -']}
                className="custom-scroll-text"
              />
            </section>

            <div style={{ height: '600px', position: 'relative' }}>
              <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
            </div>
            <section className="relative py-20 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="container mx-auto relative z-10"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`h-[2px] relative ${darkTheme ? 'bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent' : 'bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent'}`}
                  >
                    <motion.div
                      animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </section>
            <div style={{ height: '600px', position: 'relative' }}>
              <FlowingMenu items={demoItems} />
            </div>

            {/* Animated Line Divider */}
            <section className="relative py-20 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="container mx-auto relative z-10"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`h-[2px] relative ${darkTheme ? 'bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent' : 'bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent'}`}
                  >
                    <motion.div
                      animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    />
                  </motion.div>
                </div>
              </motion.div>
        
            </section>

            <FloatingCategories darkTheme={darkTheme} />

            <section id="cta" className={`relative py-20 px-4 md:px-12 ${darkTheme ? 'bg-gradient-to-br from-neutral-900 to-neutral-800' : 'bg-gradient-to-br from-gray-200 to-gray-100'}`}>
              <div className="container mx-auto text-center">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`text-3xl md:text-5xl font-bold mb-8 ${darkTheme ? 'text-white' : 'text-gray-900'}`}
                >
                  JOIN THE DIGITAL FASHION REVOLUTION
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`max-w-3xl mx-auto mb-12 text-lg ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Be the first to access exclusive drops, limited editions, and members-only benefits in the world of digital fashion.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row justify-center gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-8 py-4 rounded-full font-bold ${darkTheme
                      ? 'bg-fuchsia-600 hover:bg-fuchsia-700'
                      : 'bg-fuchsia-500 hover:bg-fuchsia-600'
                      } text-white transition-colors duration-200`}
                  >
                    Connect Wallet
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-8 py-4 rounded-full font-bold border-2 transition-colors duration-200 ${darkTheme
                      ? 'border-fuchsia-400 text-white hover:bg-fuchsia-900/20'
                      : 'border-fuchsia-500 text-gray-900 hover:bg-fuchsia-50'
                      }`}
                  >
                    View Roadmap
                  </motion.button>
                </motion.div>
              </div>
            </section>

            {/* Footer */}
            <footer className={`relative ${darkTheme ? 'bg-black/40' : 'bg-white/40'} backdrop-blur-xl border-t ${darkTheme ? 'border-neutral-800/30' : 'border-gray-200/30'}`}>
              <div className=" mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 relative">
                {/* Decorative Elements */}
                <motion.div 
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkTheme ? 'bg-fuchsia-500' : 'bg-fuchsia-400'}`} />
                  <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkTheme ? 'bg-purple-500' : 'bg-purple-400'}`} />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                  {/* Brand Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`w-10 h-10 rounded-xl ${darkTheme ? 'bg-gradient-to-br from-fuchsia-500 to-purple-500' : 'bg-gradient-to-br from-fuchsia-400 to-purple-400'} flex items-center justify-center shadow-lg shadow-fuchsia-500/20`}
                      >
                        <span className="text-2xl font-bold text-white">A</span>
                      </motion.div>
                      <motion.span 
                        animate={{
                          backgroundPosition: ['0%', '100%', '0%'],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className={`text-2xl font-bold bg-gradient-to-r ${darkTheme ? 'from-fuchsia-500 via-purple-500 to-fuchsia-500' : 'from-fuchsia-400 via-purple-400 to-fuchsia-400'} bg-[length:200%_auto] bg-clip-text text-transparent`}
                      >
                        AesthetX
                      </motion.span>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className={`text-sm ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Redefining digital fashion with cutting-edge technology and sustainable innovation.
                    </motion.p>
                    <div className="flex items-center space-x-4">
                      {[
                        { icon: <FiTwitter className="w-5 h-5" />, label: "Twitter", href: "#" },
                        { icon: <FiInstagram className="w-5 h-5" />, label: "Instagram", href: "#" },
                        { icon: <FiMessageCircle className="w-5 h-5" />, label: "Discord", href: "#" }
                      ].map((social, index) => (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative"
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          <div className={`absolute inset-0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkTheme ? 'bg-fuchsia-500/20' : 'bg-fuchsia-400/20'}`} />
                          <div className={`relative p-2 rounded-lg ${darkTheme ? 'bg-neutral-800/50 hover:bg-neutral-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} transition-colors duration-300 shadow-lg shadow-fuchsia-500/10`}>
                            {social.icon}
                          </div>
                          <span className="sr-only">{social.label}</span>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick Links */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <motion.h3 
                      animate={{
                        backgroundPosition: ['0%', '100%', '0%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className={`text-lg font-semibold bg-gradient-to-r ${darkTheme ? 'from-fuchsia-500 via-purple-500 to-fuchsia-500' : 'from-fuchsia-400 via-purple-400 to-fuchsia-400'} bg-[length:200%_auto] bg-clip-text text-transparent`}
                    >
                      Quick Links
                    </motion.h3>
                    <ul className="space-y-3">
                      {['Drops', 'Collections', 'Marketplace', 'AR Try-On'].map((item, index) => (
                        <motion.li 
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <a 
                            href="#" 
                            className={`group flex items-center space-x-2 ${darkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors duration-300`}
                          >
                            <motion.span 
                              className={`w-1 h-1 rounded-full ${darkTheme ? 'bg-fuchsia-500/50' : 'bg-fuchsia-400/50'}`}
                              whileHover={{ scale: 2 }}
                              transition={{ duration: 0.2 }}
                            />
                            <span>{item}</span>
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Resources */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                  >
                    <motion.h3 
                      animate={{
                        backgroundPosition: ['0%', '100%', '0%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className={`text-lg font-semibold bg-gradient-to-r ${darkTheme ? 'from-fuchsia-500 via-purple-500 to-fuchsia-500' : 'from-fuchsia-400 via-purple-400 to-fuchsia-400'} bg-[length:200%_auto] bg-clip-text text-transparent`}
                    >
                      Resources
                    </motion.h3>
                    <ul className="space-y-3">
                      {['Help Center', 'Blog', 'Terms', 'Privacy'].map((item, index) => (
                        <motion.li 
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <a 
                            href="#" 
                            className={`group flex items-center space-x-2 ${darkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors duration-300`}
                          >
                            <motion.span 
                              className={`w-1 h-1 rounded-full ${darkTheme ? 'bg-fuchsia-500/50' : 'bg-fuchsia-400/50'}`}
                              whileHover={{ scale: 2 }}
                              transition={{ duration: 0.2 }}
                            />
                            <span>{item}</span>
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Newsletter */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                  >
                    <motion.h3 
                      animate={{
                        backgroundPosition: ['0%', '100%', '0%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className={`text-lg font-semibold bg-gradient-to-r ${darkTheme ? 'from-fuchsia-500 via-purple-500 to-fuchsia-500' : 'from-fuchsia-400 via-purple-400 to-fuchsia-400'} bg-[length:200%_auto] bg-clip-text text-transparent`}
                    >
                      Stay Updated
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className={`text-sm ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Subscribe to our newsletter for the latest drops and exclusive offers.
                    </motion.p>
                    <form className="space-y-4">
                      <motion.div 
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                      >
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className={`w-full px-4 py-3 rounded-lg ${darkTheme ? 'bg-neutral-800/50 text-white placeholder-gray-400' : 'bg-gray-100/50 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 ${darkTheme ? 'focus:ring-fuchsia-500/50' : 'focus:ring-fuchsia-400/50'} transition-all duration-300 shadow-lg shadow-fuchsia-500/10`}
                        />
                      </motion.div>
                      <motion.button
                        type="submit"
                        className={`w-full px-4 py-3 rounded-lg font-medium relative group overflow-hidden ${darkTheme ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 'bg-gradient-to-r from-fuchsia-400 to-purple-400'} text-white hover:opacity-90 transition-opacity duration-300 shadow-lg shadow-fuchsia-500/20`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        <span className="relative">Subscribe</span>
                      </motion.button>
                    </form>
                  </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="mt-16 pt-8 border-t border-black/10 dark:border-white/10"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <motion.p 
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`text-sm ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      © 2024 AesthetX. All rights reserved.
                    </motion.p>
                    <div className="flex items-center space-x-4">
                      <motion.button
                        onClick={() => setDarkTheme(!darkTheme)}
                        className={`p-2 rounded-lg ${darkTheme ? 'bg-neutral-800/50 hover:bg-neutral-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} transition-colors duration-300 shadow-lg shadow-fuchsia-500/10`}
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {darkTheme ? (
                          <FiSun className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <FiMoon className="w-5 h-5 text-purple-500" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </footer>
          </>
        )}
      </main>
    </ErrorBoundaryComponent>
  )
}