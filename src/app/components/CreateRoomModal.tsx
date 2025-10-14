"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import CreateRoomForm from "@/components/CreateRoomForm";

export default function CreateRoomModal() {
  return (
    <Modal>
      <ModalTrigger className="bg-gradient-to-r from-[#00ffff] to-[#00aaff] hover:from-[#00aaff] hover:to-[#0088ff] text-[#0a0a0f] px-8 py-4 rounded-lg font-semibold flex justify-center items-center gap-2 group/modal-btn shadow-lg hover:shadow-[#00ffff]/50 transition-all duration-200">
        <span className="group-hover/modal-btn:translate-x-1 transition duration-300">
          Create New Room
        </span>
        <svg className="w-5 h-5 group-hover/modal-btn:translate-x-1 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <CreateRoomForm />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}