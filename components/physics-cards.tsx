"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Matter from "matter-js"
import { Scheme } from "@/lib/types"

interface PhysicsCard {
  body: Matter.Body
  scheme: Scheme
}

interface PhysicsCardsProps {
  schemes: Scheme[]
  onCardClick: (scheme: Scheme) => void
}

export function PhysicsCards({ schemes, onCardClick }: PhysicsCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const cardsRef = useRef<PhysicsCard[]>([])
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null)

  const getCardColor = (category: string | null) => {
    const colors: Record<string, string> = {
      Agriculture: "#22c55e",
      Education: "#3b82f6",
      Healthcare: "#ef4444",
      Business: "#f59e0b",
      Housing: "#8b5cf6",
      Employment: "#06b6d4",
      Savings: "#ec4899",
      Pension: "#14b8a6",
      Skills: "#f97316",
    }
    return colors[category || ""] || "#6366f1"
  }

  const renderCards = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const cards = cardsRef.current

    // Clear existing card elements
    const existingCards = container.querySelectorAll(".physics-card")
    existingCards.forEach((card) => card.remove())

    cards.forEach(({ body, scheme }) => {
      const cardEl = document.createElement("div")
      cardEl.className = `physics-card absolute cursor-grab active:cursor-grabbing transition-shadow`
      cardEl.style.width = `${body.bounds.max.x - body.bounds.min.x}px`
      cardEl.style.height = `${body.bounds.max.y - body.bounds.min.y}px`
      cardEl.style.transform = `translate(${body.position.x - (body.bounds.max.x - body.bounds.min.x) / 2}px, ${body.position.y - (body.bounds.max.y - body.bounds.min.y) / 2}px) rotate(${body.angle}rad)`
      cardEl.style.backgroundColor = "var(--card)"
      cardEl.style.border = `3px solid ${getCardColor(scheme.category)}`
      cardEl.style.borderRadius = "12px"
      cardEl.style.padding = "12px"
      cardEl.style.boxShadow =
        selectedCard === scheme.id
          ? `0 0 0 3px ${getCardColor(scheme.category)}40, 0 10px 40px -10px rgba(0,0,0,0.3)`
          : "0 4px 20px -5px rgba(0,0,0,0.15)"
      cardEl.style.willChange = "transform"
      cardEl.style.userSelect = "none"
      cardEl.style.touchAction = "none"

      cardEl.innerHTML = `
        <div class="flex flex-col gap-1 pointer-events-none">
          <span class="text-xs font-medium px-2 py-0.5 rounded-full w-fit" style="background: ${getCardColor(scheme.category)}20; color: ${getCardColor(scheme.category)}">${scheme.category || "General"}</span>
          <h3 class="font-semibold text-sm text-card-foreground line-clamp-2" style="color: var(--card-foreground)">${scheme.name}</h3>
          <p class="text-xs text-muted-foreground line-clamp-2">${scheme.ministry || ""}</p>
        </div>
      `

      cardEl.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelectedCard(scheme.id)
        onCardClick(scheme)
      })

      container.appendChild(cardEl)
    })
  }, [onCardClick, selectedCard])

  useEffect(() => {
    if (!containerRef.current || schemes.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    })
    engineRef.current = engine

    // Create walls
    const wallOptions = { isStatic: true, render: { visible: false } }
    const walls = [
      Matter.Bodies.rectangle(width / 2, height + 30, width + 100, 60, wallOptions), // Bottom
      Matter.Bodies.rectangle(-30, height / 2, 60, height + 100, wallOptions), // Left
      Matter.Bodies.rectangle(width + 30, height / 2, 60, height + 100, wallOptions), // Right
    ]

    // Create cards
    const cardWidth = Math.min(180, width / 4)
    const cardHeight = 100
    const cards: PhysicsCard[] = schemes.map((scheme, index) => {
      const x = Math.random() * (width - cardWidth) + cardWidth / 2
      const y = -100 - index * 50 - Math.random() * 100

      const body = Matter.Bodies.rectangle(x, y, cardWidth, cardHeight, {
        chamfer: { radius: 12 },
        friction: 0.3,
        frictionAir: 0.02,
        restitution: 0.3,
        label: scheme.id,
      })

      return { body, scheme }
    })

    cardsRef.current = cards
    Matter.Composite.add(engine.world, [...walls, ...cards.map((c) => c.body)])

    // Mouse control
    const mouse = Matter.Mouse.create(container)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    })
    mouseConstraintRef.current = mouseConstraint
    Matter.Composite.add(engine.world, mouseConstraint)

    // Keep mouse in sync with container scroll
    mouse.element.removeEventListener("mousewheel", (mouse as unknown as { mousewheel: () => void }).mousewheel)
    mouse.element.removeEventListener("DOMMouseScroll", (mouse as unknown as { mousewheel: () => void }).mousewheel)

    // Animation loop
    let animationId: number
    const animate = () => {
      Matter.Engine.update(engine, 1000 / 60)
      
      // Update card positions
      const cardEls = container.querySelectorAll(".physics-card")
      cards.forEach(({ body }, index) => {
        const el = cardEls[index] as HTMLElement
        if (el) {
          el.style.transform = `translate(${body.position.x - cardWidth / 2}px, ${body.position.y - cardHeight / 2}px) rotate(${body.angle}rad)`
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    // Initial render
    renderCards()
    animate()

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      
      // Update walls
      Matter.Body.setPosition(walls[0], { x: newWidth / 2, y: newHeight + 30 })
      Matter.Body.setVertices(walls[0], Matter.Bodies.rectangle(newWidth / 2, newHeight + 30, newWidth + 100, 60).vertices)
      Matter.Body.setPosition(walls[2], { x: newWidth + 30, y: newHeight / 2 })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
      Matter.Engine.clear(engine)
      Matter.Composite.clear(engine.world, false)
    }
  }, [schemes, renderCards])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-background to-secondary/30"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Cards are rendered dynamically via DOM manipulation */}
    </div>
  )
}
