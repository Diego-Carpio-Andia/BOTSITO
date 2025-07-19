const puppeteer = require("puppeteer");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function ejecutarFormulario(nombre, fn, userObj) {
  try {
    await fn();
    userObj[nombre] = true;
    console.log(`${nombre} OK`);
  } catch (error) {
    userObj[nombre] = false;
    console.log(`${nombre} ERROR:`, error.message);
  }
}

async function entelForm(page, celular) {
  await page.goto('https://www.entel.pe/ofertas-y-promociones/', { waitUntil: 'load' });
  await page.click('.entel-form-btns__callme');
  await page.type('.validate-form-test', celular);
  const checkbox = await page.waitForSelector('#checkbox-modal-test', { visible: true });
  const isVisible = await checkbox.evaluate(el => el.offsetWidth > 0 && el.offsetHeight > 0);
  const isEnabled = await checkbox.evaluate(el => !el.disabled);
  if (isVisible && isEnabled) await checkbox.click();
  await page.click('.form-content__main__btn-submit');
  await wait(5000);
}

async function movistarForm(page, dni, celular) {
  await page.goto('https://tiendaonline.movistar.com.pe/ofertas/servicioshogar/home', {
    waitUntil: 'networkidle2'
  });

  await page.waitForSelector('input[name="phone"]', { visible: true });
  await page.type('input[name="phone"]', celular);

  await page.waitForSelector('input[name="dni"]', { visible: true });
  await page.type('input[name="dni"]', dni);

  await page.waitForFunction(() => {
    const btn = document.querySelector('button.form-btn');
    return btn && !btn.disabled && btn.offsetHeight > 0 && btn.offsetWidth > 0;
  });

  await page.click('button.form-btn');
  await wait(5000);
}

async function bitelForm(page, dni, celular, nombre) {
  await page.goto('https://tiendabitel.com.pe/pedidos/pedido-chip.html?chip=4', { waitUntil: 'load' });
  await page.evaluate(() => {
    const radio = [...document.querySelectorAll('input[name="modalidad"]')].find(el => el.value === 'Nuevo número');
    if (radio) radio.click();
  });
  await page.type('input[name="nombres"]', nombre);
  await page.type('input[name="numero_documento"]', dni);
  await page.type('input[name="telefono"]', celular);
  await page.select('select[name="departamento"]', 'LORETO');
  await page.waitForFunction(() => {
    const sel = document.querySelector('select[name="distrito"]');
    return sel && sel.options.length > 1;
  });
  await page.select('select[name="distrito"]', 'MAYNAS - IQUITOS');
  await page.type('input[name="direccion"]', 'LORETO');
  await page.click('#enviar');
  await wait(5000);

  await page.goto('https://tiendabitel.com.pe/pedidos/pedido-chip.html?chip=5', { waitUntil: 'load' });
  await page.evaluate(() => {
    const radio = [...document.querySelectorAll('input[name="modalidad"]')].find(el => el.value === 'Portabilidad');
    if (radio) radio.click();
  });
  await page.select('select[name="operador_porta"]', 'Movistar (Prepago)');
  await page.type('input[name="numero_porta"]', celular);
  await page.type('input[name="nombres"]', nombre);
  await page.type('input[name="numero_documento"]', dni);
  await page.type('input[name="telefono"]', celular);
  await page.select('select[name="departamento"]', 'LORETO');
  await page.waitForFunction(() => {
    const sel = document.querySelector('select[name="distrito"]');
    return sel && sel.options.length > 1;
  });
  await page.select('select[name="distrito"]', 'MAYNAS - IQUITOS');
  await page.type('input[name="direccion"]', 'LORETO');
  await page.click('#enviar');
  await wait(5000);
}

async function fiberProForm(page, dni, celular) {
  await page.goto('https://fiberpro.com.pe/contacto/', { waitUntil: 'networkidle2' });

  await page.waitForSelector('#dni');
  await page.type('#dni', dni);

  await page.waitForSelector('#telefono');
  await page.type('#telefono', celular);

  await page.click('#pp');
  await page.click('#tdp');

  await page.waitForFunction(() => {
    const btn = document.querySelector('#submit-btn');
    return btn && !btn.disabled;
  });

  await page.click('#submit-btn');
  await wait(5000);
}

function removeAccents(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

async function nubyxForm(page, dni, celular, nombre, apellido) {
  await page.goto('https://www.nubyx.pe/contacto/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#form_contact');
  await page.type('#name', nombre);
  await page.type('#lastname', apellido);
  await page.select('#doc_type', 'DNI');
  await page.type('#doc_number', dni);
  await page.type('#phone', celular);
  const cleanNombre = removeAccents(nombre.toLowerCase());
  const cleanApellido = removeAccents(apellido.toLowerCase());
  await page.type('#email', `${cleanNombre}.${cleanApellido}@hotmail.com`);
  await page.type('#message', 'Hola, por favor necesito atención para adquirir sus servicios. Gracias.');
  await page.click('#terms');
  await page.click('#data-protect');
  await page.click('button.send-contact');
  await new Promise(resolve => setTimeout(resolve, 10000));
}

async function winForm(page, dni, celular) {
  await page.goto('https://win-internet.com.pe/', { waitUntil: 'load' });
  await page.type('input[name="phone"]', celular);
  await page.type('input[name="observations"]', dni);
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.click('.custom-checkbox');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.click('.btn-form_content');
  await new Promise(resolve => setTimeout(resolve, 4000));
}

const GuardarHistorialUsuario = async (req, res) => {
  const { dni, celular, nombre, apellido } = req.body;

  if (!dni || !celular) {
    return res.status(400).send({ status: "error", message: "Faltan datos" });
  }

  const userObj = { nombre, apellido };

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 5,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--window-position=50,50',
      '--window-size=1800,900'
    ]
  });
  const page = await browser.newPage();

  try {
    await ejecutarFormulario("entel", () => entelForm(page, celular), userObj);
    await ejecutarFormulario("movistar", () => movistarForm(page, dni, celular), userObj);
    await ejecutarFormulario("bitel", () => bitelForm(page, dni, celular, nombre), userObj);
    await ejecutarFormulario("win", () => winForm(page, dni, celular), userObj);
    await ejecutarFormulario("nubyx", () => nubyxForm(page, dni, celular, nombre, apellido), userObj);
    await ejecutarFormulario("fiberPro", () => fiberProForm(page, dni, celular), userObj);
  } catch (error) {
    console.error("Error general en Puppeteer:", error);
    return res.status(500).send({ status: "error", message: "Error en Puppeteer" });
  } finally {
    await browser.close();
    return res.status(200).send({
      status: "success",
      message: "Los estados se han procesado correctamente",
      resultados: userObj
    });
  }
};

module.exports = { GuardarHistorialUsuario };
