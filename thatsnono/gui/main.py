import tkinter as tk
from tkinter import scrolledtext, simpledialog

class ChatGUI:
    def __init__(self, master):
        self.master = master
        self.master.title("Simple Chat")
        self.master.geometry("400x300")

        self.text_area = scrolledtext.ScrolledText(self.master, wrap=tk.WORD, width=40, height=10)
        self.text_area.pack(padx=10, pady=10)

        self.input_entry = tk.Entry(self.master, width=30)
        self.input_entry.pack(pady=10)

        self.send_button = tk.Button(self.master, text="Send", command=self.send_message)
        self.send_button.pack()

    def send_message(self):
        message = self.input_entry.get()
        if message:
            self.text_area.insert(tk.END, f"You: {message}\n")
            self.input_entry.delete(0, tk.END)

if __name__ == "__main__":
    root = tk.Tk()
    app = ChatGUI(root)
    root.mainloop()
