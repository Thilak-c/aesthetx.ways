import ProductDetail from './ProductDetail'

export default function ProductPage({ params }) {
  return <ProductDetail id={params.id} />
} 