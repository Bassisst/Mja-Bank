const cardNumber = document.querySelector('.card-number');
const cardHolder = document.querySelector('.card-name');
const cardValidity = document.querySelector('.card-validity');
const payButton = document.getElementById('payButton');

const defaultValues = {
  number: '0000 0000 0000 0000',
  name: 'Cardholder Name',
  validity: '00/00'
};

function updateCardNumber(input) {
  let inputValue = input.value.replace(/\D/g, '');
  let formattedValue = '';

  for (let i = 0; i < inputValue.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += ' ';
    }
    formattedValue += inputValue[i];
  }

  input.value = formattedValue;
  cardNumber.innerText = formattedValue || defaultValues.number;
}

function updateCardHolder(input) {
  let inputValue = input.value.replace(/[^A-Za-z ]/g, '');
  input.value = inputValue;
  cardHolder.innerText = inputValue || defaultValues.name;
}

function updateValidity(input) {
  let inputValue = input.value.replace(/\D/g, '');
  let formattedValue = '';

  for (let i = 0; i < inputValue.length; i++) {
    if (i === 2) {
      formattedValue += '/';
    }
    formattedValue += inputValue[i];
  }

  input.value = formattedValue;
  cardValidity.innerText = formattedValue || defaultValues.validity;
}

payButton.addEventListener('click', () => {
  const amount = document.getElementById('amount').value;
  if (!amount || amount <= 0) {
    alert('Enter a valid amount');
    return;
  }
  alert(`Payment of $${amount} was successful!`);
});
