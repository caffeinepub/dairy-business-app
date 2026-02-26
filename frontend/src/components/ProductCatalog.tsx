import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Package, Star } from 'lucide-react';

interface Product {
  name: string;
  description: string;
  unit: string;
  price: string;
  category: string;
  highlight?: boolean;
}

const products: Product[] = [
  {
    name: 'Fresh Buffalo Milk',
    description:
      'Pure, farm-fresh buffalo milk collected daily from our healthy herd. Rich in protein and calcium.',
    unit: 'per litre',
    price: '₹80',
    category: 'Milk',
    highlight: true,
  },
  {
    name: 'Fresh Cow Milk',
    description:
      'Wholesome cow milk from our pasture-raised cattle. Ideal for daily consumption and cooking.',
    unit: 'per litre',
    price: '₹60',
    category: 'Milk',
  },
  {
    name: 'Desi Ghee',
    description:
      'Traditionally prepared pure desi ghee from buffalo milk. Rich aroma and authentic taste.',
    unit: 'per 500g',
    price: '₹450',
    category: 'Dairy Products',
    highlight: true,
  },
  {
    name: 'Fresh Paneer',
    description:
      'Soft, fresh paneer made from full-fat buffalo milk. Perfect for curries and snacks.',
    unit: 'per 250g',
    price: '₹120',
    category: 'Dairy Products',
  },
  {
    name: 'Curd / Yogurt',
    description:
      'Thick, creamy curd set from fresh buffalo milk. Naturally probiotic and delicious.',
    unit: 'per 500g',
    price: '₹60',
    category: 'Dairy Products',
  },
  {
    name: 'Butter',
    description:
      'Freshly churned white butter from cream. No preservatives, pure and natural.',
    unit: 'per 200g',
    price: '₹100',
    category: 'Dairy Products',
  },
];

const categoryColors: Record<string, string> = {
  Milk: 'bg-farm-sky/10 text-farm-sky border-farm-sky/30',
  'Dairy Products': 'bg-farm-green/10 text-farm-green border-farm-green/30',
};

export default function ProductCatalog() {
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold font-display">Our Products</h2>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {category}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.category === category)
              .map((product) => (
                <Card
                  key={product.name}
                  className={`relative transition-shadow hover:shadow-card-hover ${
                    product.highlight ? 'border-primary/40 bg-primary/5' : ''
                  }`}
                >
                  {product.highlight && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground text-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`w-fit text-xs ${categoryColors[product.category] ?? ''}`}
                    >
                      {product.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xl font-bold text-primary">{product.price}</span>
                      <span className="text-xs text-muted-foreground">{product.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
