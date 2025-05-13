// product-management.jsx
import dynamic from 'next/dynamic';
const ProductTable = dynamic(() => import('./ProductTable'), { ssr: false });

export default function InventoryManagements() {
  return (
    <div>
      <h2>Product Management</h2>
      <ProductTable />
    </div>
  );
}
