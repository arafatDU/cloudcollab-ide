"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AboutModal({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* <div className="text-sm text-muted-foreground">
            CloudCollab IDE is an open-source cloud-based code editing environment with
            custom AI code autocompletion and real-time collaboration.
          </div> */}

          <div className="space-y-2">
            <div className="text-sm">
              <a 
                href="https://github.com/arafatDU/cloudcollab-ide/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Report issues on GitHub →
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
