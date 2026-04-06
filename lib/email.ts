import nodemailer from 'nodemailer';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// HTML template for welcome email
function getWelcomeEmailTemplate(name: string, plan: string): string {
  const planNames: Record<string, string> = {
    solo: 'Start',
    maker: 'Maker',
    studio: 'Studio',
    agency: 'Agency',
  };

  const displayPlan = planNames[plan] || plan;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0A0A0A;
          color: #E5E5E5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #111111;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #7C3AED 0%, #C026D3 100%);
          padding: 40px 24px;
          text-align: center;
        }
        .header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
        }
        .content {
          padding: 40px 32px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 24px;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          color: #A0A0A0;
          margin-bottom: 32px;
        }
        .plan-badge {
          display: inline-block;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(192, 38, 211, 0.1));
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 32px;
          font-weight: 600;
          color: #A78BFA;
        }
        .features {
          background: rgba(124, 58, 237, 0.05);
          border: 1px solid rgba(124, 58, 237, 0.1);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .features h3 {
          font-size: 14px;
          font-weight: 600;
          color: #7C3AED;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 15px;
          color: #A0A0A0;
        }
        .feature-item:last-child {
          margin-bottom: 0;
        }
        .feature-icon {
          color: #7C3AED;
          margin-right: 12px;
          font-weight: bold;
          font-size: 18px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED 0%, #C026D3 100%);
          color: #FFFFFF;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 32px;
          transition: all 0.3s ease;
          text-align: center;
          width: 100%;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }
        .footer {
          border-top: 1px solid #2A2A2A;
          padding: 24px 32px;
          text-align: center;
          font-size: 13px;
          color: #666666;
        }
        .footer p {
          margin-bottom: 8px;
        }
        .footer a {
          color: #7C3AED;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bem-vindo ao CreatorFlow! 🚀</h1>
          <p>Sua jornada de criação começa agora</p>
        </div>

        <div class="content">
          <div class="greeting">Olá ${name}!</div>

          <div class="message">
            Sua conta foi criada com sucesso no <strong>CreatorFlow</strong>.
            Você agora tem acesso a todas as ferramentas de IA para potencializar sua produção de conteúdo.
          </div>

          <div class="plan-badge">
            ✨ Plano ${displayPlan} ativado
          </div>

          <div class="features">
            <h3>Seu plano inclui:</h3>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Acesso completo ao suite de IA CreatorFlow</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>7 dias de trial antes do primeiro pagamento</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Suporte técnico via comunidade</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Acesso a novas features em primeira mão</span>
            </div>
          </div>

          <a href="https://creatorflowia.com/dashboard" class="cta-button">
            Acessar meu Dashboard
          </a>

          <div class="message" style="font-size: 14px; margin-bottom: 0;">
            Dúvidas? Entre em contato: <a href="mailto:contato@creatorflowia.com" style="color: #7C3AED; text-decoration: none;">contato@creatorflowia.com</a>
          </div>
        </div>

        <div class="footer">
          <p>CreatorFlow © 2026 | Suite de IA para criadores de conteúdo</p>
          <p>
            <a href="https://creatorflowia.com">Website</a> •
            <a href="mailto:contato@creatorflowia.com">Email</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// HTML template for trial activated email
function getTrialActivatedEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0A0A0A;
          color: #E5E5E5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #111111;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          padding: 40px 24px;
          text-align: center;
        }
        .header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
        }
        .content {
          padding: 40px 32px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 24px;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          color: #A0A0A0;
          margin-bottom: 32px;
        }
        .highlight {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: center;
        }
        .highlight h3 {
          font-size: 24px;
          font-weight: 800;
          color: #10B981;
          margin-bottom: 8px;
        }
        .highlight p {
          font-size: 14px;
          color: #A0A0A0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          color: #FFFFFF;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 32px;
          transition: all 0.3s ease;
          text-align: center;
          width: 100%;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }
        .footer {
          border-top: 1px solid #2A2A2A;
          padding: 24px 32px;
          text-align: center;
          font-size: 13px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Trial Ativado! ✅</h1>
          <p>Seu período de teste começou</p>
        </div>

        <div class="content">
          <div class="greeting">Oi ${name}!</div>

          <div class="message">
            Seu trial de 7 dias foi ativado com sucesso.
            Explore todas as funcionalidades do CreatorFlow sem custo durante este período.
          </div>

          <div class="highlight">
            <h3>7 dias grátis</h3>
            <p>Após isso, começaremos a cobrar automaticamente no seu cartão de crédito</p>
          </div>

          <a href="https://creatorflowia.com/dashboard" class="cta-button">
            Começar agora
          </a>

          <div class="message" style="font-size: 14px; margin-bottom: 0;">
            Qualquer dúvida, estamos aqui para ajudar: <a href="mailto:contato@creatorflowia.com" style="color: #10B981; text-decoration: none;">contato@creatorflowia.com</a>
          </div>
        </div>

        <div class="footer">
          <p>CreatorFlow © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send welcome email after account creation
export async function sendWelcomeEmail(name: string, email: string, plan: string): Promise<boolean> {
  try {
    const htmlContent = getWelcomeEmailTemplate(name, plan);

    await transporter.sendMail({
      from: `"CreatorFlow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🚀 Bem-vindo ao CreatorFlow! Sua conta está pronta',
      html: htmlContent,
    });

    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}:`, error);
    return false;
  }
}

// Send trial activated email
export async function sendTrialActivatedEmail(name: string, email: string): Promise<boolean> {
  try {
    const htmlContent = getTrialActivatedEmailTemplate(name);

    await transporter.sendMail({
      from: `"CreatorFlow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Seu trial foi ativado! 7 dias grátis no CreatorFlow',
      html: htmlContent,
    });

    console.log(`✅ Trial activated email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending trial activated email to ${email}:`, error);
    return false;
  }
}
