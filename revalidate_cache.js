// Cache'i temizlemek için admin settings API'sine istek atıyoruz
async function revalidate() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/settings/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      console.log('✅ Cache temizlendi!');
    } else {
      console.log('⚠️ Revalidate endpoint bulunamadı, manuel cache temizliği gerekebilir');
    }
  } catch (error) {
    console.log('ℹ️ Cache endpoint bulunamadı, sayfa yenilenince güncellenecek');
  }
}

revalidate();
