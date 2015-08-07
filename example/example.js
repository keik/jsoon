window.onload = function () {
  function $ () {
    return document.querySelector.apply(document, arguments);
  }

  var dataEl = $('#data'),
      formEl = $('#form'),
      queryEl = $('#query'),
      resultEl = $('#result');

  dataEl.addEventListener('change', function (e) {
    try {
      JSON.parse(this.value);
      this.style.borderColor = '';
    } catch (err) {
      this.style.borderColor = 'red';
      resultEl.innerHTML += '<span style="color: red">fail to parse JSON</span><br><br>';
    }
  });

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();

    resultEl.appendChild(document.createTextNode('-> ' + queryEl.value));
    resultEl.innerHTML += '<br>';
    var data = JSON.parse(dataEl.value);
    try {
      resultEl.appendChild(document.createTextNode('<- ' + JSON.stringify(eval(queryEl.value))));
    } catch (err) {
      resultEl.innerHTML += '<span style="color: red">' + err.name + ': ' + err.message + '</span>';
    } finally {
      resultEl.innerHTML += '<br><br>';
      resultEl.scrollTop = Infinity;
    }

    return false;
  });
};
