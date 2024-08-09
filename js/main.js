"use strict";

const shopItemList = document.querySelector(".shop_itemList");
const searchBox = document.querySelector("#searchBox");

function loadItems() {
    return fetch("./store.json")
    .then((res) => res.json())
    .then((json) => json.products);
}

function displayShopItems(products) {
    shopItemList.innerHTML = products
        .map((product) => creatShopItem(product))
        .join("");
}

function creatShopItem(product) {
    return `<div data-id=${product.id} class="shop_itemList_item" draggable="true">
    <img src=./${product.photo} alt="shopItemImg" class="shop_itemList_img" draggable="false">
    <h3 class="shop_itemList_item_productName">
        ${product.product_name}
    </h3>
    <span class="shop_itemList_item_branName">
        ${product.brand_name}
    </span>
    <span class="shop_itemList_item_price">
        ${product.price}
    </span>
</div>`;    
}

function searchFiilter() {
    const value = searchBox.value;
    const shopItemName = document.querySelectorAll(
        ".shop_itemList_item_productName"
    );
    shopItemName.forEach((e) => {
        if (e.innerText.search(value) > -1) {
            showOrHideItem(e.parentElement, "flex");
        } else {
            showOrHideItem(e.parentElement, "none");
        }
    });
}

function showOrHideItem(target, showOrHide) {
    target.style.display = `${showOrHide}`;
}

function dragEvent() {
    const shopItem = document.querySelectorAll(".shop_itemList_item");
    const dropArea = document.querySelector(".cart_cartBox_dropArea");

    for (let i = 0; i < shopItem.length; i++) {
        shopItem[i].addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", e.target.dataset.id);
        });
    }

    dropArea.addEventListener("dragover", dragOverHandler);
    dropArea.addEventListener("drop", dropHandler);
}

function creatCartItem(i) {
    const shopItem = document.querySelectorAll(".shop_itemList_item");
    const shopItemImg = document.querySelectorAll(".shop_itemList_img");
    const shopItemName = document.querySelectorAll(
        ".shop_itemList_item_productName"
    );
    const shopItemBrand = document.querySelectorAll(
        ".shop_itemList_item_branName"
    );
    const shopItemPrice = document.querySelectorAll(
        ".shop_itemList_item_price"
    );
    return `<div class="cart_cartBox_itemList_item" data-id='${shopItem[i].dataset.id}'>
    <img src="${shopItemImg[i].src}" alt="cartItemImg">
    <h3 class="cartItem_productName">
        ${shopItemName[i].innerText}
    </h3>
    <span class="cartItem_brandName">
    ${shopItemBrand[i].innerText}
    </span>
    <form>
        <label class="cartItemQuantity">수량</label>
        <input type="number" class="cartItemInput" data-id-input='${shopItem[i].dataset.id}' value=0>
        <input type="text" style="display:none">
    </form>
    <span class="cartItem_price" data-price='${shopItemPrice[i].innerText}'>${shopItemPrice[i].innerText}</span>
</div>
</div>`;
}

function dropHandler(e) {
    const cartItemList = document.querySelector(".cart_cartBox_itemList");
    const dataId = e.dataTransfer.getData("text");
    const exists = document.querySelectorAll(`[data-id='${dataId}']`);

    if (exists.length < 2) {
        cartItemList.insertAdjacentHTML("beforeend", creatCartItem(dataId));
        increaseQuantity(dataId);
        updateCart();
    } else {
        increaseQuantity(dataId);
        updateCart();
    }
    writeInputBox();
}

function dragOverHandler(e) {
    e.preventDefault();
}

function increaseQuantity(id) {
    const cartItemInput = document.querySelector(`[data-id-input='${id}']`);
    cartItemInput.value = Number(cartItemInput.value) + 1;
}

function updateCart() {
    const cartItemQuantity = document.querySelectorAll(".cartItemInput");
    const cartItemPrice = document.querySelectorAll(".cartItem_price");
    const totalPrice = document.querySelector(".cart_cartBox_totalPrice");

    for (let i = 0; i < cartItemPrice.length; i++) {
        cartItemPrice[i].innerText = `${
            cartItemPrice[i].dataset.price * Number(cartItemQuantity[i].value)
        }`;
    }

    let total = 0;
    cartItemPrice.forEach(function (e) {
        total = total + Number(e.innerText);
    });

    totalPrice.innerText = total;
}

function writeInputBox() {
    const cartItemQuantity = document.querySelectorAll(".cartItemInput");
    cartItemQuantity.forEach((e) => {
        e.addEventListener("keyup", (event) => {
            updateCart();
        });
    });
}

function clickPurchaseBtn() {
    const container = document.querySelector(".cart");
    container.addEventListener("click", clickPurchaseEvent);
}

function clickPurchaseEvent(e) {
    const cartItemList = document.querySelector(".cart_cartBox_itemList");
    const purchaseBtn = document.querySelector(".cart_cartBox_purchaseBtn");
    const blackBackground = document.querySelector(".blackBackground");
    const modal = document.querySelector(".purchase_modal");
    const modalSubmitBtn = document.querySelector(".purchase_modal_submitBtn");
    const cancelPurchaseBtn = document.querySelector(
        ".purchase_modal_cancelBtn"
    );
    const receipt = document.querySelector(".receiptContainer");
    const receiptBtn = document.querySelector(".receiptBtn");

    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
        return;
    }
    if (e.target == purchaseBtn) {
        if(!cartItemList.hasChildNodes()) {
            alert("상품을 담아주세요.");
        } else {
            scrollToTop();
            showOrHideItem(blackBackground, "block");
            showOrHideItem(modal, "block");
        }
    }
    if (e.target == cancelPurchaseBtn) {
        showOrHideItem(blackBackground, "none");
        showOrHideItem(modal, "none");
    }
    if (e.target == modalSubmitBtn) {
        updateReceipt();
        showOrHideItem(modal, "none");
        showOrHideItem(receipt, "block");
    }
    if (e.target == receiptBtn) {
        showOrHideItem(receipt, "none");
        showOrHideItem(blackBackground, "none");
    }
}

function scrollToTop() {
    scrollTo(0, 0);
}

function updateReceipt() {
    const today = new Date();
    const cartItemName = document.querySelectorAll(".cartItem_productName");
    const cartItemBrand = document.querySelectorAll(".cartItem_brandName");
    const cartItemQuantity = document.querySelectorAll(".cartItemInput");
    const cartItemPrice = document.querySelectorAll(".cartItem_price");
    const totalPrice = document.querySelector(".cart_cartBox_totalPrice");
    const receipt = document.querySelector("#receipt");
    const ctx = receipt.getContext("2d");
    ctx.font = "20px serif";
    ctx.fillText("영수증", 30, 50);
    ctx.font = "12px serif";
    ctx.fillText(today.toLocaleDateString(), 30, 70);
    ctx.fillText(today.toLocaleTimeString(), 120, 70);
    for (let i = 0; i < cartItemName.length; i++) {
        ctx.font = "16px serif";
        ctx.fillText(` 제품명 : ${cartItemName[i].innerText}`, 30, 100 * (i + 1));
        ctx.fillText(
            ` 브랜드 : ${cartItemBrand[i].innerText}`, 
            30, 
            100 * (i + 1) + 20
        );
        ctx.fillText(
            ` 수량 : ${cartItemQuantity[i].value}개`, 
            30, 
            100 * (i + 1) + 40
        );
        ctx.fillText(
            ` 금액 : ${cartItemPrice[i].innerText}원`, 
            30, 
            100 * (i + 1) + 60
        );
    }
    ctx.fillText(` 총액 : ${totalPrice.innerText}원`, 400, 500);
}

loadItems()
    .then((products) => {
        displayShopItems(products);
    })
    .then(() => {
        dragEvent();
        clickPurchaseBtn();
        searchBox.addEventListener("keyup", searchFiilter);
    });