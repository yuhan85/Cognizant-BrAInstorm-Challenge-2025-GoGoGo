export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Leaf 1 - Dark olive green, top-left, curves up-right */}
      <path
        d="M 20 75 
           Q 15 60, 20 45
           Q 25 30, 35 25
           Q 50 20, 60 30
           Q 70 40, 65 55
           Q 60 70, 50 70
           Q 40 75, 30 75
           Q 25 75, 20 75 Z"
        fill="#6B8E23"
      />
      
      {/* Leaf 2 - Bright lime green, bottom-right, curves up-left, overlapping */}
      <path
        d="M 80 25
           Q 85 40, 80 55
           Q 75 70, 65 75
           Q 50 80, 40 70
           Q 30 60, 35 45
           Q 40 30, 50 30
           Q 60 25, 70 25
           Q 75 25, 80 25 Z"
        fill="#9ACD32"
      />
    </svg>
  )
}

