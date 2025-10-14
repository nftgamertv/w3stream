import { createClient } from '@/utils/supabaseClients/client'
import { queryOptions } from '@tanstack/react-query'

export const userOptions = queryOptions({
  queryKey: [`user`],
  queryFn: async () => {
     

    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        throw error
    }
    if (!data.user) {
        throw new Error('No user found')
    }       
    return data.user    

  },
})