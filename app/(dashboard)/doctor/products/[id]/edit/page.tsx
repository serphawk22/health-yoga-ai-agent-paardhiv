import { ProductForm } from '@/components/marketplace/ProductForm';
import { getProduct } from '@/lib/actions/marketplace';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const result = await getProduct(params.id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-6 space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-health-text">Edit Product</h1>
                <p className="text-health-muted">Update your product listing</p>
            </div>

            <div className="card p-6">
                <ProductForm product={result.data} isEditing />
            </div>
        </div>
    );
}
