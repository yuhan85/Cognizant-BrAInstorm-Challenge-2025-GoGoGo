import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Logo } from '@/components/logo'

export function Footer() {
  return (
    <footer className="bg-[#FDFDFD] border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Farm2Table Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-6 w-6" />
              <span className="text-xl font-bold text-[#2D4A36]">Farm2Table</span>
            </div>
            <p className="text-sm text-[#2D4A36] mb-2">
              Connecting local farms to communities, one fresh delivery at a time.
            </p>
            <div className="flex items-center gap-1 text-sm text-[#2D4A36]">
              <Heart className="h-4 w-4 text-[#E53935]" fill="#E53935" />
              <span>30% net income donated</span>
            </div>
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="font-bold text-[#2D4A36] mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/farms" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Partner Farms
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-[#2D4A36] mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Delivery Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="font-bold text-[#2D4A36] mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#2D4A36] hover:text-[#4CAF50] transition-colors">
                  Facebook
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-[#2D4A36]">
            © 2025 Farm2Table. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

