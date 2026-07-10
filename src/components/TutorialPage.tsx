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
              Abra o aplicativo da Steam no seu dispositivo móvel e toque no ícone de "Escudo" no menu inferior. Essa aba é a aba do Steam Guard, onde os códigos de acesso são gerados.
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
              Na tela do Steam Guard, você verá um código de 5 caracteres sendo gerado e atualizado periodicamente. Esse é o código que você precisa inserir no campo do CardHarvester.
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
