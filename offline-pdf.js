(function(){
  function binary(bytes){let s='',size=0x8000;for(let i=0;i<bytes.length;i+=size)s+=String.fromCharCode(...bytes.subarray(i,i+size));return s}
  function imageBytes(src){const raw=atob(src.split(',')[1]),b=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)b[i]=raw.charCodeAt(i);return b}
  function dimensions(b){for(let i=2;i<b.length-9;){if(b[i]!==255){i++;continue}const marker=b[i+1],len=(b[i+2]<<8)|b[i+3];if(marker>=192&&marker<=199)return {width:(b[i+7]<<8)|b[i+8],height:(b[i+5]<<8)|b[i+6]};i+=2+len}throw new Error('JPEG inválido')}
  window.BlexoOfflinePdf=function(images,name){
    if(!images.length)throw new Error('Nenhuma página para exportar');
    const objects=[],add=x=>(objects.push(x),objects.length),font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'),root=add(null),pages=[];
    images.forEach((src,index)=>{const b=imageBytes(src),d=dimensions(b),img=add(`<< /Type /XObject /Subtype /Image /Width ${d.width} /Height ${d.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${b.length} >>\nstream\n${binary(b)}\nendstream`),stream=`q\n595.28 0 0 841.89 0 0 cm\n/Im${index+1} Do\nQ`,content=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);pages.push(add(`<< /Type /Page /Parent ${root} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${font} 0 R >> /XObject << /Im${index+1} ${img} 0 R >> >> /Contents ${content} 0 R >>`))});
    objects[root-1]=`<< /Type /Pages /Kids [${pages.map(x=>x+' 0 R').join(' ')}] /Count ${pages.length} >>`;
    const catalog=add(`<< /Type /Catalog /Pages ${root} 0 R >>`);let out='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n',offsets=[0];
    objects.forEach((obj,i)=>{offsets[i+1]=out.length;out+=`${i+1} 0 obj\n${obj}\nendobj\n`});
    const start=out.length;out+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${start}\n%%EOF`;
    const bytes=new Uint8Array(out.length);for(let i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255;
    const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name||'blexo-relatorio.pdf';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return blob;
  };
})();