// Your code here
document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.getElementById("films");
    const poster = document.getElementById("poster");
    const title = document.getElementById("title");
    const runtime = document.getElementById("runtime");
    const showtime = document.getElementById("showtime");
    const availableTickets = document.getElementById("available-tickets");
    const buyTicketButton = document.getElementById("buy-ticket");

    // Fetch and display the films on page load
    fetch("http://localhost:3000/films")
        .then(response => response.json())
        .then(films => {
            filmsList.innerHTML = ""; // Clear placeholder
            films.forEach(film => {
                const li = document.createElement("li");
                li.className = "film item";
                li.dataset.id = film.id;
                li.innerText = film.title;
                li.addEventListener("click", () => loadFilmDetails(film.id));
                
                const deleteButton = document.createElement("button");
                deleteButton.innerText = "Delete";
                deleteButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    deleteFilm(film.id, li);
                });
                
                li.appendChild(deleteButton);
                filmsList.appendChild(li);
            });
            // Load the first film's details
            if (films.length > 0) {
                loadFilmDetails(films[0].id);
            }
        });
    
    function loadFilmDetails(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`)
            .then(response => response.json())
            .then(film => {
                poster.src = film.poster;
                title.innerText = film.title;
                runtime.innerText = `Runtime: ${film.runtime} minutes`;
                showtime.innerText = `Showtime: ${film.showtime}`;
                
                const ticketsAvailable = film.capacity - film.tickets_sold;
                availableTickets.innerText = `Available Tickets: ${ticketsAvailable}`;
                buyTicketButton.disabled = ticketsAvailable <= 0;
                buyTicketButton.onclick = () => buyTicket(film);
                
                if (ticketsAvailable <= 0) {
                    filmsList.querySelector(`li[data-id="${film.id}"]`).classList.add("sold-out");
                    buyTicketButton.innerText = "Sold Out";
                } else {
                    filmsList.querySelector(`li[data-id="${film.id}"]`).classList.remove("sold-out");
                    buyTicketButton.innerText = "Buy Ticket";
                }
            });
    }

    function buyTicket(film) {
        if (film.tickets_sold < film.capacity) {
            film.tickets_sold++;
            
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tickets_sold: film.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedFilm => {
                loadFilmDetails(updatedFilm.id);
                // Post new ticket purchase (if needed)
                fetch("http://localhost:3000/tickets", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        film_id: updatedFilm.id,
                        number_of_tickets: 1
                    })
                });
            });
        }
    }

    function deleteFilm(filmId, li) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: "DELETE"
        })
        .then(() => {
            li.remove();
            if (filmsList.children.length === 0) {
                availableTickets.innerText = "";
                poster.src = "";
                title.innerText = "";
                runtime.innerText = "";
                showtime.innerText = "";
                buyTicketButton.disabled = true;
            } else {
                loadFilmDetails(filmsList.children[0].dataset.id);
            }
        });
    }
});
