import { BookOpen, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-black text-lg text-[#0b1530]">
              <span className="grid place-items-center w-7 h-7 rounded-lg text-white text-xs font-black bg-gradient-to-br from-[#56dded] to-[#176cff]">
                ▤
              </span>
              <span>
                Book<span className="text-[#1768ed]">Loop</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              A trusted campus marketplace for Polytechnic students in Bangladesh to buy and
              sell verified used textbooks.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/browse" className="hover:text-foreground transition-colors">
                Browse Books
              </Link>
              <Link href="/sell" className="hover:text-foreground transition-colors">
                Sell a Book
              </Link>
              <Link href="/orders" className="hover:text-foreground transition-colors">
                My Orders
              </Link>
              <Link href="/wishlist" className="hover:text-foreground transition-colors">
                Wishlist
              </Link>
            </nav>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">How It Works</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>1. Create a verified account</span>
              <span>2. List or find a book</span>
              <span>3. Complete the transaction</span>
              <span>4. Campus pickup</span>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@polytechnicbooks.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+880 1700 000000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Polytechnic Used Book Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
