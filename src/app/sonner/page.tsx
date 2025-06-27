"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function SonnerDemo() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">

   
    <Button
      variant="default"
      onClick={() =>
        toast.warning("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
            duration: 5000,
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
     </main>
  )
}
