import { render, screen } from "@testing-library/vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "@/App.vue";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div>Home</div>" } },
      { path: "/remitos", component: { template: "<div>Remitos</div>" } },
      {
        path: "/listas-precio",
        component: { template: "<div>Listas de precio</div>" }
      },
      {
        path: "/comprobantes",
        component: { template: "<div>Comprobantes</div>" }
      },
      { path: "/clientes", component: { template: "<div>Clientes</div>" } },
      { path: "/productos", component: { template: "<div>Productos</div>" } }
    ]
  });
}

describe("App shell", () => {
  it("renders the application header", async () => {
    const router = createTestRouter();
    await router.push("/");
    await router.isReady();

    render(App, {
      global: {
        plugins: [createPinia(), [VueQueryPlugin], router]
      }
    });

    expect(screen.getByText("FITBA Frontend Vue")).toBeTruthy();
  });
});
