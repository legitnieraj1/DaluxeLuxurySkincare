import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Protect all /admin paths
  if (url.pathname.startsWith('/admin')) {
    if (!user) {
      // Not logged in, redirect to login
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Optional: Check for admin role in the profiles table
    // Since we are in the middleware, we can't easily wait for a DB call on every single request
    // if performance is a concern, but for a small admin panel it's fine.
    // However, it's safer to check it here to prevent even initial render of dashboard for customers.
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      // Logged in but not an admin
      url.pathname = '/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in admins away from login page to dashboard
  if (url.pathname === '/login' && user) {
      const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

      if (profile?.role === 'admin') {
          url.pathname = '/admin/dashboard';
          return NextResponse.redirect(url);
      }
  }

  return supabaseResponse;
}
