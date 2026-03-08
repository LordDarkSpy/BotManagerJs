/**
 * Atualiza o nickname do membro seguindo o padrao [prefixo] nome | ID
 */
export async function atualizarNickname(member, prefixo, nome, id) {
    try {
        const partes = [];
        if (prefixo) {
            partes.push(prefixo);
        }
        partes.push(nome);
        partes.push('|');
        partes.push(id);
        const novoNickname = partes.join(' ').substring(0, 32);
        await member.setNickname(novoNickname);
        console.log(`[Nickname] Atualizado para: ${novoNickname}`);
        return true;
    }
    catch (error) {
        console.error('[Nickname] Erro ao atualizar:', error);
        return false;
    }
}
//# sourceMappingURL=nickname.js.map