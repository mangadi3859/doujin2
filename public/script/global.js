const navBtn = $("[data-nav-btn]");

navBtn.on("click", () => {
    $(".navbar-phone").toggleClass("active");
    $(document.body).toggleClass("active");
});
