import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, email, nome, whatsapp } = body;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    if (tipo === 'aprovacao') {
      // Log notification (in production, use email service like Resend/SendGrid)
      console.log(`[NOTIFICAÇÃO] Corretor aprovado: ${nome} (${email}) - WhatsApp: ${whatsapp}`);

      // Build WhatsApp notification link (gestor clicks to notify corretor)
      const msgWpp = encodeURIComponent(
        `Olá ${nome}! 🎉\n\nSeu cadastro na plataforma ImóveisApp foi *aprovado*!\n\nAcesse agora: ${siteUrl}/login\n\nBoas vendas! 🏠`
      );
      const numeroLimpo = whatsapp.replace(/\D/g, '');
      const wppLink = `https://wa.me/55${numeroLimpo}?text=${msgWpp}`;
      
      return NextResponse.json({ success: true, wppLink });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao notificar:', error);
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 });
  }
}
