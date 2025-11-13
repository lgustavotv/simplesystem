import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift, Trash2, Sparkles } from 'lucide-react';

export default function Home() {
  const [dishes, setDishes] = useState([]);
  const [name, setName] = useState('');
  const [dishName, setDishName] = useState('');
  const [dishType, setDishType] = useState('salgado');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadDishes();
    
    const subscription = supabase
      .channel('dishes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dishes' },
        () => {
          loadDishes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setDishes(data || []);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !dishName.trim()) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    try {
      const newDish = {
        id: Date.now(),
        name: name.trim(),
        dish_name: dishName.trim(),
        type: dishType,
      };

      const { error } = await supabase
        .from('dishes')
        .insert([newDish]);
      
      if (error) throw error;

      setName('');
      setDishName('');
      setDishType('salgado');
      
      await loadDishes();
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao adicionar prato. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadDishes();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao remover prato. Tente novamente.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const salgados = dishes.filter(d => d.type === 'salgado');
  const doces = dishes.filter(d => d.type === 'doce');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-green-50 to-red-100 flex items-center justify-center">
        <div className="text-xl text-red-700 flex items-center gap-2">
          <Sparkles className="animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-green-50 to-red-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 to-green-600 rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border-4 border-yellow-400 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-2 left-4 text-6xl">❄️</div>
            <div className="absolute top-4 right-8 text-5xl">⭐</div>
            <div className="absolute bottom-2 left-8 text-4xl">🎄</div>
            <div className="absolute bottom-4 right-4 text-6xl">🎅</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Gift className="text-yellow-300 animate-bounce" size={isMobile ? 28 : 40} />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
                🎄 Bingo Natalício 2025 🎄
              </h1>
              <Gift className="text-yellow-300 animate-bounce" size={isMobile ? 28 : 40} />
            </div>
            <p className="text-yellow-100 text-center text-sm sm:text-lg font-semibold drop-shadow">
              ✨ Cadastre o que você vai levar para nossa festa! ✨
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-4 border-red-300">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-bold text-red-700 mb-2 flex items-center gap-2">
                <span className="text-xl">🎅</span> Seu Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
                placeholder="Digite seu nome"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-bold text-red-700 mb-2 flex items-center gap-2">
                <span className="text-xl">🍽️</span> Nome do Prato
              </label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
                placeholder="Ex: Lasanha, Bolo de Chocolate..."
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-bold text-red-700 mb-2">
                Tipo de Prato
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <label className="flex items-center cursor-pointer bg-orange-50 p-3 sm:p-4 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all flex-1">
                  <input
                    type="radio"
                    value="salgado"
                    checked={dishType === 'salgado'}
                    onChange={(e) => setDishType(e.target.value)}
                    className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-base sm:text-lg font-semibold text-orange-800">🍕 Salgado</span>
                </label>
                <label className="flex items-center cursor-pointer bg-pink-50 p-3 sm:p-4 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all flex-1">
                  <input
                    type="radio"
                    value="doce"
                    checked={dishType === 'doce'}
                    onChange={(e) => setDishType(e.target.value)}
                    className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-base sm:text-lg font-semibold text-pink-800">🍰 Doce</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-green-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-red-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-yellow-400"
            >
              🎁 Adicionar Prato
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-xl p-4 sm:p-6 border-4 border-orange-300">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl">🍕</span> 
              <span>Salgados</span>
              <span className="text-xs sm:text-sm bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full border-2 border-white shadow-lg">
                {salgados.length}
              </span>
            </h2>
            <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
              {salgados.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-orange-400 italic text-sm sm:text-base">🎄 Nenhum salgado cadastrado ainda 🎄</p>
                </div>
              ) : (
                salgados.map(dish => (
                  <div key={dish.id} className="flex justify-between items-start p-3 sm:p-4 bg-white rounded-xl border-2 border-orange-300 shadow-md hover:shadow-lg transition-all">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-gray-800 text-sm sm:text-base break-words">{dish.dish_name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">🎅 {dish.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0 p-1"
                      title="Remover"
                    >
                      <Trash2 size={isMobile ? 16 : 20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-xl p-4 sm:p-6 border-4 border-pink-300">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-800 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl">🍰</span>
              <span>Doces</span>
              <span className="text-xs sm:text-sm bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full border-2 border-white shadow-lg">
                {doces.length}
              </span>
            </h2>
            <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
              {doces.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-pink-400 italic text-sm sm:text-base">⭐ Nenhum doce cadastrado ainda ⭐</p>
                </div>
              ) : (
                doces.map(dish => (
                  <div key={dish.id} className="flex justify-between items-start p-3 sm:p-4 bg-white rounded-xl border-2 border-pink-300 shadow-md hover:shadow-lg transition-all">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-gray-800 text-sm sm:text-base break-words">{dish.dish_name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">🎅 {dish.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0 p-1"
                      title="Remover"
                    >
                      <Trash2 size={isMobile ? 16 : 20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {dishes.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl shadow-xl p-3 sm:p-5 text-center border-4 border-yellow-400">
            <p className="text-gray-800 font-bold text-base sm:text-lg flex items-center justify-center gap-2 flex-wrap">
              <Sparkles className="text-red-600" size={isMobile ? 20 : 24} />
              <span>Total de pratos:</span>
              <span className="text-xl sm:text-2xl text-red-600">{dishes.length}</span>
              <Sparkles className="text-green-600" size={isMobile ? 20 : 24} />
            </p>
          </div>
        )}

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-red-700 font-semibold text-xs sm:text-sm">
            🎄✨ Feliz Natal e um Próspero Ano Novo! ✨🎄
          </p>
        </div>
      </div>
    </div>
  );
}
