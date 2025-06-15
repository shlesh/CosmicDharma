def calculate_core_elements(planets):
    """
    Compute elemental balances based on signs of planets.
    Returns dict of five tattvas percentages.
    """
    elements = {'Fire':0,'Earth':0,'Air':0,'Water':0,'Space':0}
    sign_to_element = {
        1:'Fire',2:'Earth',3:'Air',4:'Water',5:'Fire',6:'Earth',7:'Space',8:'Space',
        9:'Fire',10:'Water',11:'Air',12:'Earth'
    }
    for p in planets:
        element = sign_to_element[p['sign']]
        elements[element] += 1
    total = len(planets)
    for k in elements:
        elements[k] = round((elements[k]/total)*100, 1)
    return elements

