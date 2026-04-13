import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase/client';

webpush.setVapidDetails(
  'mailto:admin@luminaskincare.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const subscription = await req.json();
    
    // In a real app, save the subscription to the database associated with an admin user ID.
    // For now, we simulate saving.
    
    // Example:
    // await supabaseAdmin.from('push_subscriptions').insert({ subscription });

    return NextResponse.json({ success: true, message: 'Subscription successful' });
  } catch (error: any) {
    console.error('Error handling subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // Utility route to test broadcast to an admin
  try {
    const { subscription, payload } = await req.json();
    
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    
    return NextResponse.json({ success: true, message: 'Notification sent' });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
