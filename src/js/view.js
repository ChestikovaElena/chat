export default {
  render(templateName, model) { // имя шаблона, данные
    templateName = templateName + 'Template';
    const source = document.getElementById(templateName).textContent;
    let template = Handlebars.compile(source);

    return template(model);
  }
}
