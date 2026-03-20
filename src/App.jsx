import { useState, useMemo } from "react";

const DATA = [
  { obra: "500100605", nCliente: "8", cliente: "SOUTH PARADISE, S.A.", descripcion: "MONITORIZACION Y HELPDESK PRINCESS TAURITO 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "400100545", nCliente: "12", cliente: "SANTIAGO SUR SLU", descripcion: "SERVICIOS MENSUAL DE MONITORIZACION Y HELPDESK CLIENTES PQSIII-IV-V", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100066", nCliente: "336", cliente: "DREAMPLACE HOTELS&RESORTS,S.L.", descripcion: "ADMINISTRACION y GESTION RED 2025 - DREAMPLACE", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "TV/IPTV": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": true } } },
  { obra: "500100067", nCliente: "336", cliente: "DREAMPLACE HOTELS&RESORTS,S.L.", descripcion: "MANT. DOMOTICO HOTEL TACANDE Y CC - 2025", servicios: { "DOMOTICA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100074", nCliente: "416", cliente: "PROMOTORA HOTELERA CANARIA, S.A.", descripcion: "MONITORIZACION y HELPDESK GUAYARMINA PRINCESS 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100075", nCliente: "416", cliente: "PROMOTORA HOTELERA CANARIA, S.A.", descripcion: "MONITORIZACION Y HELPDESK PRINCESS INSPIRE TENERIFE 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100076", nCliente: "416", cliente: "PROMOTORA HOTELERA CANARIA, S.A.", descripcion: "MANTENIMIENTO PREVENTIVO UPS HOTEL GUAYARMINA 2025", servicios: { "UPS": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100071", nCliente: "509", cliente: "CANSUR, S.L", descripcion: "MONITORIZACION Y HELPDESK MASPALOMAS Y TABAIBA PRINCESS 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100262", nCliente: "601", cliente: "LAS MADRIGUERAS", descripcion: "GESTION REMOTA CABECERA CANALES INGLESES", servicios: { "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100077", nCliente: "644", cliente: "EUROPE HOTELS INTERNACIONAL TENERIFE SL", descripcion: "EXPLOTACION DE RED DE CLIENTES COMUNICACIONES ELECTRONICAS HOTEL EUROPE PARK 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100077", nCliente: "644", cliente: "EUROPE HOTELS INTERNACIONAL TENERIFE SL", descripcion: "EXPLOTACION DE RED DE CLIENTES COMUNICACIONES ELECTRONICAS HOTEL VILLA CORTES 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100079", nCliente: "1083", cliente: "GOMERA VERDE, S.A.", descripcion: "MONITORIZACION Y SUPERV. PLAYA CALERA 2025", servicios: { "DOMOTICA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100080", nCliente: "1234", cliente: "DEPOSITOS ALMACENES Nº 1, S.A.", descripcion: "MANTENIMIENTO y SOPORTE C.C. MARTIANEZ 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100081", nCliente: "1242", cliente: "HOTEL GRAN REY S.L.", descripcion: "MANTENIMIENTO Y MONITORIZACION REMOTA H GRAN REY 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100082", nCliente: "1249", cliente: "INSTITUCION FERIAL DE TENERIFE,S.A.", descripcion: "MONITORIZACION y HELPDESK RECINTO FERIAL 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "400100561", nCliente: "1365", cliente: "RENT2NDHOMETENERIFE, S.L.", descripcion: "MANTENIMIENTO RED OFIMATICA BAOBAB 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100083", nCliente: "1387", cliente: "DIAMOND RESORTS EUROPE LTD, SUC. ESPAÑA SBGOC", descripcion: "MANT. CCTV, MEGAFONIA, TV Y TELF - 2025", servicios: { "VOIP/TELEFONIA": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": true }, "CCTV": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": true }, "AUDIOVISUALES": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": true }, "TV/IPTV": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": true } } },
  { obra: "500100084", nCliente: "1582", cliente: "SAN EUGENIO, S.A.", descripcion: "MONITORIZACION y HELPDESK H. VILLA MARIA 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "400100560", nCliente: "1610", cliente: "CP. BAOBAB DOMAINS DE ADEJE", descripcion: "MANTENIMIENTO Y MONITORIZACION BAOBAB 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true } } },
  { obra: "500100085", nCliente: "1695", cliente: "C.P. CC SIAM MALL", descripcion: "MANTENIMIENTO CC SIAM MALL - 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100086", nCliente: "1718", cliente: "HAMIDIA, S.L.", descripcion: "MONITORIZACION y HELPDESK CC GALEON 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true } } },
  { obra: "500100088", nCliente: "1780", cliente: "BARCELO ARRENDAMIENTOS HOTELEROS SL", descripcion: "MMTO. CORALES - GPON y NETWORKING 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true } } },
  { obra: "500100089", nCliente: "1780", cliente: "BARCELO ARRENDAMIENTOS HOTELEROS SL", descripcion: "PORTAL CAUTIVO HOTSPOT CORALES SUITES 2025", servicios: { "DOMOTICA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true } } },
  { obra: "500100090", nCliente: "1780", cliente: "BARCELO ARRENDAMIENTOS HOTELEROS SL", descripcion: "MTO. CORALES - SERVICIOS DE SEGURIDAD Y AUDIOVISUALES 2025", servicios: { "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true } } },
  { obra: "500100092", nCliente: "1831", cliente: "KILDESA, S.L.", descripcion: "MONITORIZACION Y HELPDESK LOS OLIVOS 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true } } },
  { obra: "500100093", nCliente: "1833", cliente: "VALLE DE LA OROTAVA, S.A.", descripcion: "MONITORIZACION y HELPDESK. BASICO 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "DOMOTICA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100094", nCliente: "1835", cliente: "EXPLOTACIONES GANADERAS DE TENERIFE S.A.", descripcion: "MONITORIZACION REMOTA Y HELPDESK 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100096", nCliente: "1847", cliente: "CDAD. PROP. CC MOGAN MALL", descripcion: "GESTION DE SERVICIOS DE TELECOMUNICACION MOGAN MALL 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "TV/IPTV": { "MONIT": false, "HELP": false, "PREV. PRES.": false, "COR. PRES.": true } } },
  { obra: "400100010", nCliente: "1854", cliente: "CP EDIF. COLINAS DE LOS MENCEYES", descripcion: "MONITORIZACION Y HELPDESK COLINAS 2024", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100098", nCliente: "1860", cliente: "ZIDAY DE INVERSIONES, S.L.", descripcion: "ADMINISTRACION y GESTION RED 2025 - HOTEL GRAN TIGOTAN", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100099", nCliente: "1861", cliente: "CDAD. PROP. C.C. ROSA CENTER", descripcion: "MANTENIMIENTO y SOPORTE C.C. ROSA CENTER 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100100", nCliente: "1886", cliente: "CDAD.PROP. INFINITY I", descripcion: "MONITORIZACION Y HELPDESK INFINITY 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100057", nCliente: "1907", cliente: "BOULEVARD RESTAURANTS 21 SL", descripcion: "SERVICIOS DE EXPLOTACION MENSUAL BOULEVAR 21 PQS", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100101", nCliente: "1930", cliente: "SAND AND SEA RESORTS SL", descripcion: "MONITORIZACION Y HELPDESK JARDINES 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100102", nCliente: "1943", cliente: "HOCASOL SA / VILLA DE ADEJE BEACH", descripcion: "MONITORIZACION Y HELPDESK VILLA ADEJE 2025", servicios: { "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "300100409", nCliente: "1945", cliente: "CB CENTRO COMERCIAL OPEN MALL", descripcion: "ADM. Y GESTION RED COMUNICACIONES OPEN MALL 2023/2024", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "TV/IPTV": { "MONIT": false, "HELP": false, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100104", nCliente: "1956", cliente: "HOTEL SEM TAORO SL", descripcion: "MONITORIZACION Y HELPDESK SEM TAORO 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100105", nCliente: "1964", cliente: "ARCHIPIELAGO Y TURISMO S.A.", descripcion: "EXPLOTACION RED DE IPTV HOTEL TIVOLI (MMTO ANUAL) 2025", servicios: { "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100106", nCliente: "1964", cliente: "ARCHIPIELAGO Y TURISMO S.A.", descripcion: "", servicios: { "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100400", nCliente: "1991", cliente: "EMPRESA TRANSFORMACION AGRARIA SA SME MP", descripcion: "SISTEMA HOTSPOT OBRA MANTENIMIENTO TELECOMUNICACIONES Y SEGURIDAD OBRA LAS RAICES 2025-2026", servicios: { "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true } } },
  { obra: "500100034", nCliente: "1991", cliente: "EMPRESA TRANSFORMACION AGRARIA SA SME MP", descripcion: "SERVICIOS OBRA MANTENIMIENTO COMUNICACIONES Y SEGURIDAD OBRA LAS RAICES 2025-2026", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100365", nCliente: "1995", cliente: "SAND AND SEA RESORTS SL", descripcion: "MONITORIZACION Y HELPDESK RED CORPORATIVA E INTERIOR APTOS LAGOS DE FAÑABE 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100328", nCliente: "1997", cliente: "CP LOS LAGOS DE FAÑABE DE ADEJE", descripcion: "MONITORIZACION Y HELPDESK RED CLIENTES LAGOS DE FAÑABE 2025", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": true }, "TV/IPTV": { "MONIT": false, "HELP": false, "PREV. PRES.": false, "COR. PRES.": true } } },
  { obra: "500100186", nCliente: "2000", cliente: "BARCELO ARRENDAMIENTOS HOTELEROS SL", descripcion: "SERVICIOS DE TELECOMUNICACIONES Y SEGURIDAD CORALES VILLAS", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "CCTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "UPS": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "AUDIOVISUALES": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false }, "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": false } } },
  { obra: "500100187", nCliente: "2000", cliente: "BARCELO ARRENDAMIENTOS HOTELEROS SL", descripcion: "", servicios: { "DOMOTICA": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "500100493", nCliente: "2007", cliente: "SAGARIKA SL", descripcion: "GESTION REMOTA CABECERA CANALES INGLESES", servicios: { "TV/IPTV": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "600200454", nCliente: "2008", cliente: "CP CONJUNTO RES. LOS CARDONES DE ARONA CPRPH", descripcion: "MONITORIZACIÓN Y HELPDESK RED WIFI CLIENTES LOS CARDONES", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "600200454", nCliente: "2008", cliente: "CP CONJUNTO RES. LOS CARDONES DE ARONA CPRPH", descripcion: "AMPLIACION CONTRATO DE SERVICIOS 24/7 LOS CARDONES", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "600200454", nCliente: "2008", cliente: "CP CONJUNTO RES. LOS CARDONES DE ARONA CPRPH", descripcion: "AMPLIACION MONITORIZACION Y HELPDESK RED CONTROL DE ACCESO", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": false, "COR. PRES.": false } } },
  { obra: "600200166", nCliente: "1604", cliente: "QUARZAZATE, S.L.", descripcion: "MONITORIZACION Y HELPDESK RED NETWORKING / VOIP Y ADMIN. PRESENCIAL PABELLON DE VENTAS", servicios: { "WIFI": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true }, "VOIP/TELEFONIA": { "MONIT": true, "HELP": true, "PREV. PRES.": true, "COR. PRES.": true } } },
];

const CAT_CONFIG = {
  "WIFI":           { icon: "📶", color: "#6366f1" },
  "VOIP/TELEFONIA": { icon: "📞", color: "#0ea5e9" },
  "CCTV":           { icon: "📷", color: "#f59e0b" },
  "UPS":            { icon: "🔋", color: "#10b981" },
  "AUDIOVISUALES":  { icon: "🔊", color: "#ec4899" },
  "TV/IPTV":        { icon: "📺", color: "#8b5cf6" },
  "DOMOTICA":       { icon: "🏠", color: "#14b8a6" },
};

const SVC_LABELS = {
  "MONIT":       { short: "MON", label: "Monitorización" },
  "HELP":        { short: "HLP", label: "Helpdesk" },
  "PREV. PRES.": { short: "PRV", label: "Prev. Presencial" },
  "COR. PRES.":  { short: "COR", label: "Cor. Presencial" },
};

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toUpperCase().indexOf(query.toUpperCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#f59e0b", color: "#1a1a2e", borderRadius: "2px", padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function CategoryRow({ cat, svcs }) {
  const cfg = CAT_CONFIG[cat];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "5px 10px", borderRadius: "6px",
      background: cfg.color + "11", border: `1px solid ${cfg.color}22`,
    }}>
      <span style={{ fontSize: "13px" }}>{cfg.icon}</span>
      <span style={{ fontSize: "11px", fontWeight: 700, color: cfg.color, width: "100px", flexShrink: 0 }}>{cat}</span>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {Object.entries(svcs).map(([svc, active]) => active ? (
          <span key={svc} title={SVC_LABELS[svc].label} style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em",
            padding: "2px 6px", borderRadius: "3px",
            background: cfg.color + "25", color: cfg.color,
            border: `1px solid ${cfg.color}55`,
          }}>
            {SVC_LABELS[svc].short}
          </span>
        ) : (
          <span key={svc} title={SVC_LABELS[svc].label} style={{
            fontSize: "9px", fontWeight: 500, letterSpacing: "0.05em",
            padding: "2px 6px", borderRadius: "3px",
            background: "#1e1b4b", color: "#374151",
            border: "1px solid #1e293b",
          }}>
            {SVC_LABELS[svc].short}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return DATA;
    return DATA.filter(r =>
      r.obra.toUpperCase().includes(q) ||
      r.nCliente.toUpperCase().includes(q) ||
      r.cliente.toUpperCase().includes(q) ||
      r.descripcion.toUpperCase().includes(q)
    );
  }, [query]);

  const toggleExpand = (i) => setExpanded(expanded === i ? null : i);

  const copyText = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #0f0f1a 100%)",
        borderBottom: "1px solid #312e6e",
        padding: "22px 28px 16px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            width: 34, height: 34, borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "17px", fontWeight: "bold", color: "white", flexShrink: 0,
          }}>C</div>
          <div>
            <div style={{ fontSize: "10px", color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Contel Ingenieros</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>MONIT. Y HELPDESK — Buscador</div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#6366f1", fontSize: "16px", pointerEvents: "none" }}>⌕</span>
          <input
            type="text"
            placeholder="Buscar por obra, nº cliente, cliente o descripción..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#1e1b4b", border: "1.5px solid #4338ca", borderRadius: "10px",
              padding: "10px 36px 10px 38px", fontSize: "13px", color: "#f1f5f9",
              outline: "none", fontFamily: "inherit",
            }}
            onFocus={e => e.target.style.borderColor = "#818cf8"}
            onBlur={e => e.target.style.borderColor = "#4338ca"}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "18px" }}>×</button>
          )}
        </div>

        {/* Stats + legend */}
        <div style={{ display: "flex", gap: "14px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b" }}>
            <span style={{ color: "#818cf8", fontWeight: 700 }}>{results.length}</span> resultado{results.length !== 1 ? "s" : ""}
            {query && <span> de {DATA.length}</span>}
            {" · "}pulsa fila para ver servicios
          </span>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(SVC_LABELS).map(([k, v]) => (
              <span key={k} style={{ fontSize: "9px", color: "#475569" }}>
                <span style={{ color: "#818cf8", fontWeight: 700 }}>{v.short}</span> = {v.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "12px 18px 40px" }}>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
            <div style={{ fontSize: "14px" }}>Sin resultados para <strong style={{ color: "#818cf8" }}>"{query}"</strong></div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {results.map((row, i) => {
              const isOpen = expanded === i;
              const cats = Object.keys(row.servicios);
              return (
                <div
                  key={i}
                  onClick={() => toggleExpand(i)}
                  style={{
                    background: isOpen ? "#1a1740" : "#151528",
                    border: `1px solid ${isOpen ? "#4338ca" : "#1e1b4b"}`,
                    borderRadius: "10px", cursor: "pointer",
                    transition: "all 0.15s", overflow: "hidden",
                  }}
                  onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.background = "#181630"; e.currentTarget.style.borderColor = "#312e6e"; } }}
                  onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.background = "#151528"; e.currentTarget.style.borderColor = "#1e1b4b"; } }}
                >
                  {/* Main row */}
                  <div style={{ padding: "11px 14px", display: "grid", gridTemplateColumns: "106px 60px 1fr auto", gap: "10px", alignItems: "center" }}>
                    {/* Obra */}
                    <div>
                      <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Obra</div>
                      <div onClick={e => copyText(row.obra, e)} title="Click para copiar"
                        style={{ fontSize: "11px", fontWeight: 700, color: "#818cf8", cursor: "copy" }}>
                        {copied === row.obra ? "✓ Copiado" : highlight(row.obra, query)}
                      </div>
                    </div>
                    {/* Nº Cliente */}
                    <div>
                      <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Nº Cli.</div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#a5b4fc" }}>{highlight(row.nCliente, query)}</div>
                    </div>
                    {/* Cliente + desc */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {highlight(row.cliente, query)}
                      </div>
                      {row.descripcion && (
                        <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {highlight(row.descripcion, query)}
                        </div>
                      )}
                    </div>
                    {/* Category icons + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100px" }}>
                        {cats.map(cat => (
                          <span key={cat} title={cat} style={{
                            fontSize: "11px", padding: "2px 4px", borderRadius: "3px",
                            background: CAT_CONFIG[cat].color + "22",
                            border: `1px solid ${CAT_CONFIG[cat].color}44`,
                          }}>
                            {CAT_CONFIG[cat].icon}
                          </span>
                        ))}
                      </div>
                      <span style={{ color: "#475569", fontSize: "11px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded services */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid #2d2b55", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "5px", background: "#13112a" }}>
                      <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Servicios contratados</div>
                      {Object.entries(row.servicios).map(([cat, svcs]) => (
                        <CategoryRow key={cat} cat={cat} svcs={svcs} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        mark { font-family: inherit; }
      `}</style>
    </div>
  );
}
