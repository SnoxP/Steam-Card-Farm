import React from 'react';
import { Link } from 'react-router-dom';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
          <h1 className="text-2xl font-bold text-white">Como obter o código Steam Guard</h1>
          <Link to="/" className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded text-sm font-bold transition-colors border border-[#30363d]">
            Voltar
          </Link>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#58a6ff]">Passo 1: Acesse o aplicativo da Steam no celular</h2>
            <p className="text-sm leading-relaxed text-[#8b949e]">
              Abra o aplicativo do Steam no seu celular e faça login, se necessário.<br/>
              Toque no ícone de escudo (Steam Guard) localizado no menu inferior (é o ícone central).<br/>
              Se o código não aparecer logo de cara ou se você precisar configurar/sincronizar, toque no ícone da engrenagem (Configurações) no canto superior direito dessa tela.
            </p>
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg shadow-sm">
              <img 
                src="https://i.ibb.co/gLL5JQTP/Screenshot-20260709-214121-Steam.png" 
                alt="Passo 1" 
                className="w-full max-w-sm mx-auto rounded border border-[#30363d]"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#58a6ff]">Passo 2: Encontre e copie o código</h2>
            <p className="text-sm leading-relaxed text-[#8b949e]">
              Selecione a opção "Obter código do Steam Guard" (ou "My Steam Guard Code").<br/>
              Pronto! Um código de 5 dígitos será gerado na tela e ele muda a cada 30 segundos por segurança.
            </p>
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg shadow-sm">
              <img 
                src="https://i.ibb.co/gb97Rhtr/Screenshot-20260709-214742-Steam.png" 
                alt="Passo 2" 
                className="w-full max-w-sm mx-auto rounded border border-[#30363d]"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
