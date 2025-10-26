import {
    Dialog,
    DialogContent, 
    DialogFooter, 
    DialogTitle
} from "@/components/ui/dialog" 
 
import { useRouter } from 'next/navigation'
 
export function DialogModal({open, setOpen,title="", children, className, footer }:  any) {  
 
  const router = useRouter()
 
    return (
        <Dialog open={open} onOpenChange={setOpen}  > 
      <DialogContent className={`border-gray-700 ${className}`}>
      <DialogTitle className="text-4xl font-extrabold leading-tight w-full text-yellow-400 text-center absolute top-4">{title} </DialogTitle>
        {children}

                 <DialogFooter>
                {footer}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

 
 
