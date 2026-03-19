import { NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// POST: Seed preset templates into the database
export async function POST() {
  try {
    const existing = await db.getTemplates()
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Templates already exist', count: existing.length })
    }

    const presets = [
      {
        name: 'Travel Standard',
        category: 'Travel',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#6366F1', secondary: '#1E293B', accent: '#10B981' },
          fields: ['booking_ref', 'destination', 'travel_date', 'return_date', 'class', 'fare_breakdown'],
          style: 'professional',
        }),
      },
      {
        name: 'Travel Premium',
        category: 'Luxury Travel',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#D97706', secondary: '#1C1917', accent: '#FBBF24' },
          fields: ['booking_ref', 'destination', 'travel_date', 'return_date', 'class', 'fare_breakdown'],
          style: 'luxury',
        }),
      },
      {
        name: 'Movie / Event Ticket',
        category: 'Entertainment',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#EC4899', secondary: '#1E293B', accent: '#F472B6' },
          fields: ['movie_name', 'venue', 'seat_number', 'showtime', 'show_date'],
          style: 'modern',
        }),
      },
      {
        name: 'Hotel Booking',
        category: 'Hospitality',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#F59E0B', secondary: '#1E293B', accent: '#FCD34D' },
          fields: ['hotel_name', 'room_type', 'check_in', 'check_out', 'nightly_rate'],
          style: 'elegant',
        }),
      },
      {
        name: 'Tour Package',
        category: 'Tour Operators',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#10B981', secondary: '#1E293B', accent: '#34D399' },
          fields: ['package_name', 'start_date', 'end_date', 'pax_count', 'inclusions'],
          style: 'adventure',
        }),
      },
      {
        name: 'Freelancer',
        category: 'Consulting',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#8B5CF6', secondary: '#1E293B', accent: '#A78BFA' },
          fields: ['service_description', 'hours', 'hourly_rate', 'project_name'],
          style: 'minimal',
        }),
      },
      {
        name: 'Retail',
        category: 'E-commerce',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#EF4444', secondary: '#1E293B', accent: '#F87171' },
          fields: ['item_name', 'quantity', 'unit_price', 'discount'],
          style: 'clean',
        }),
      },
      {
        name: 'Generic Minimal',
        category: 'Any',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify({
          colors: { primary: '#64748B', secondary: '#1E293B', accent: '#94A3B8' },
          fields: ['description', 'amount'],
          style: 'minimal',
        }),
      },
    ]

    const created = []
    for (const preset of presets) {
      const t = await db.createTemplate(preset)
      created.push(t)
    }

    return NextResponse.json({ success: true, count: created.length, templates: created })
  } catch (error: unknown) {
    console.error('Seed templates error:', error)
    return NextResponse.json({ error: 'Failed to seed templates' }, { status: 500 })
  }
}
