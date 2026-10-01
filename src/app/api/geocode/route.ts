import { NextRequest, NextResponse } from 'next/server';

async function fetchNominatim(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    {
      headers: {
        'User-Agent': 'ImoveisDoVale/1.0 (contato@imoveisdovale.com.br)',
        'Accept-Language': 'pt-BR',
      },
    }
  );
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { endereco, numero, bairro, cidade, estado } = await request.json();
    
    // Tentativa 1: Endereço Completo
    const partes1 = [endereco, numero, bairro, cidade, estado, 'Brasil'].filter(Boolean);
    let coords = await fetchNominatim(partes1.join(', '));

    // Tentativa 2: Sem o número
    if (!coords && endereco) {
      const partes2 = [endereco, bairro, cidade, estado, 'Brasil'].filter(Boolean);
      coords = await fetchNominatim(partes2.join(', '));
    }

    // Tentativa 3: Só Bairro, Cidade, Estado
    if (!coords && bairro) {
      const partes3 = [bairro, cidade, estado, 'Brasil'].filter(Boolean);
      coords = await fetchNominatim(partes3.join(', '));
    }

    // Tentativa 4: Só Cidade e Estado
    if (!coords) {
      const partes4 = [cidade, estado, 'Brasil'].filter(Boolean);
      coords = await fetchNominatim(partes4.join(', '));
    }

    if (!coords) {
      return NextResponse.json({ error: 'Endereço não encontrado nem na cidade' }, { status: 404 });
    }

    return NextResponse.json(coords);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
