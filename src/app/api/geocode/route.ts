import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endereco, numero, bairro, cidade, estado } = await request.json();
    const partes = [endereco, numero, bairro, cidade, estado].filter(Boolean);
    const query = encodeURIComponent(partes.join(', ') + ', Brasil');

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'ImoveisDoVale/1.0 (contato@imoveisdovale.com.br)',
          'Accept-Language': 'pt-BR',
        },
      }
    );

    const data = await res.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
