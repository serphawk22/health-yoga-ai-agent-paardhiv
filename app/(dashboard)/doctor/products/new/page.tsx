'use client';

import { ProductForm } from '@/components/marketplace/ProductForm';

export default function NewProductPage() {
    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-6 space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-health-text">Add New Product</h1>
                <p className="text-health-muted">Create a new listing for the marketplace</p>
            </div>

            <div className="card p-6">
                <ProductForm />
            </div>
        </div>
    );
}
